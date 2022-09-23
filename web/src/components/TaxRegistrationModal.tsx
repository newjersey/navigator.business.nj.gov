import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  createEmptyProfileData,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { ReactElement, useEffect, useState } from "react";
import { OnboardingBusinessName } from "./onboarding/OnboardingBusinessName";
import { OnboardingExistingEmployees } from "./onboarding/OnboardingExistingEmployees";
import { OnboardingOwnership } from "./onboarding/OnboardingOwnership";
import { OnboardingTaxId } from "./onboarding/OnboardingTaxId";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSave: ({ redirectOnSuccess }: { redirectOnSuccess: boolean }) => void;
}

export const TaxRegistrationModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { userData, updateQueue } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());

  useEffect(() => {
    if (!userData) return;
    setProfileData(userData.profileData);
  }, [userData]);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates((prevFieldStates) => ({ ...prevFieldStates, [field]: { invalid } }));
  };

  const onSubmit = async () => {
    if (!userData || !updateQueue) return;
    const errorMap = {
      ...fieldStates,
      businessName: {
        invalid: !profileData.businessName && showBusinessField(),
      },
      existingEmployees: { invalid: !profileData.existingEmployees },
      taxId: {
        invalid: !profileData.taxId && showTaxIdField(),
      },
    };
    setFieldStates(errorMap);
    if (Object.keys(errorMap).some((k) => errorMap[k as ProfileFields].invalid)) return;

    let { taxFilingData } = userData;
    if (userData.profileData.taxId != profileData.taxId) {
      taxFilingData = { ...taxFilingData, state: undefined, filings: [] };
    }

    updateQueue.queueProfileData(profileData).queueTaxFilingData(taxFilingData);
    analytics.event.task_tax_registration_date_modal.submit.tax_registration_status_set_to_complete();
    props.onSave({ redirectOnSuccess: true });
    props.close();
  };

  const showBusinessField = () =>
    userData?.profileData.businessName === "" &&
    LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling;

  const showTaxIdField = () =>
    LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling;

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: "STARTING",
          municipalities: [],
        },
        setProfileData,
        setUser: () => {},
        onBack: () => {},
      }}
    >
      <ModalTwoButton
        isOpen={props.isOpen}
        close={props.close}
        title={Config.taxRegistrationModal.title}
        maxWidth={"md"}
        primaryButtonText={Config.taxRegistrationModal.saveButtonText}
        primaryButtonOnClick={onSubmit}
        secondaryButtonText={Config.taxRegistrationModal.cancelButtonText}
      >
        <div className="margin-bottom-3">
          <Content>{Config.taxRegistrationModal.subtitle}</Content>
        </div>
        {showBusinessField() && (
          <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} required />
        )}
        {showTaxIdField() && (
          <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} required />
        )}
        <OnboardingOwnership headerAriaLevel={3} />
        <div className="margin-top-3" aria-hidden={true} />
        <OnboardingExistingEmployees
          onValidation={onValidation}
          fieldStates={fieldStates}
          headerAriaLevel={3}
        />
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
