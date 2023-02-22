import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { ProfileNexusDBANameField } from "@/components/onboarding/ProfileNexusDBANameField";
import { TaxDisclaimer } from "@/components/TaxDisclaimer";
import { WithErrorBar } from "@/components/WithErrorBar";
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

interface Props {
  isOpen: boolean;
  close: () => void;
  onSave: ({ redirectOnSuccess }: { redirectOnSuccess: boolean }) => void;
}

export const RegisteredForTaxesModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { userData, updateQueue } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());

  useEffect(() => {
    if (!userData) {
      return;
    }
    setProfileData(userData.profileData);
  }, [userData]);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates((prevFieldStates) => {
      return { ...prevFieldStates, [field]: { invalid } };
    });
  };

  const onSubmit = async () => {
    if (!userData || !updateQueue) {
      return;
    }
    const errorMap = {
      ...fieldStates,
      nexusDbaName: {
        invalid: !profileData.nexusDbaName && showDBAField(),
      },
      businessName: {
        invalid: !profileData.businessName && showBusinessField(),
      },
      existingEmployees: {
        invalid: !profileData.existingEmployees,
      },
      taxId: {
        invalid: profileData.taxId?.length !== 12,
      },
      municipality: {
        invalid: !profileData.municipality && showMunicipalityField(),
      },
    };
    setFieldStates(errorMap);
    if (
      Object.keys(errorMap as ProfileFieldErrorMap).some((k) => {
        return errorMap[k as ProfileFields].invalid;
      })
    ) {
      return;
    }

    let { taxFilingData } = userData;
    if (userData.profileData.taxId !== profileData.taxId) {
      taxFilingData = { ...taxFilingData, state: undefined, registeredISO: undefined, filings: [] };
    }

    updateQueue.queueProfileData(profileData).queueTaxFilingData(taxFilingData);
    analytics.event.tax_registration_modal.submit.tax_registration_status_set_to_complete();

    props.onSave({ redirectOnSuccess: true });
    props.close();
  };

  const showBusinessField = (): boolean => {
    return (
      userData?.profileData.businessName === "" &&
      LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling
    );
  };

  const showMunicipalityField = (): boolean => {
    if (!userData) {
      return false;
    }
    return userData.profileData.municipality === undefined;
  };

  const showDBAField = (): boolean => {
    if (!userData) {
      return false;
    }
    return (
      userData.profileData.needsNexusDbaName &&
      userData.profileData.nexusDbaName === "" &&
      LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling
    );
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: "STARTING",
        },
        setProfileData,
        setUser: () => {},
        onBack: () => {},
      }}
    >
      <ModalTwoButton
        isOpen={props.isOpen}
        close={props.close}
        title={Config.registeredForTaxesModal.title}
        maxWidth={"md"}
        primaryButtonText={Config.registeredForTaxesModal.saveButtonText}
        primaryButtonOnClick={onSubmit}
        secondaryButtonText={Config.registeredForTaxesModal.cancelButtonText}
      >
        <div className="margin-bottom-3">
          <Content>{Config.registeredForTaxesModal.subtitle}</Content>
        </div>
        {showDBAField() && (
          <>
            <WithErrorBar hasError={fieldStates.nexusDbaName.invalid} type="ALWAYS">
              <FieldLabelModal fieldName="nexusDbaName" />
              <ProfileNexusDBANameField onValidation={onValidation} fieldStates={fieldStates} required />
            </WithErrorBar>
          </>
        )}
        {showBusinessField() && (
          <WithErrorBar hasError={fieldStates.businessName.invalid} type="ALWAYS">
            <FieldLabelModal fieldName="businessName" />
            <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} required />
          </WithErrorBar>
        )}

        <WithErrorBar hasError={fieldStates.taxId.invalid} type="ALWAYS">
          <FieldLabelModal fieldName="taxId" />
          <TaxDisclaimer legalStructureId={userData?.profileData.legalStructureId} />
          <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} required />
        </WithErrorBar>

        <FieldLabelModal fieldName="ownershipTypeIds" />
        <OnboardingOwnership />

        <div className="margin-top-3" aria-hidden={true} />
        <WithErrorBar hasError={fieldStates.existingEmployees.invalid} type="ALWAYS">
          <FieldLabelModal fieldName="existingEmployees" />
          <OnboardingExistingEmployees onValidation={onValidation} fieldStates={fieldStates} />
        </WithErrorBar>

        {showMunicipalityField() && (
          <WithErrorBar hasError={fieldStates.municipality.invalid} type="ALWAYS">
            <FieldLabelModal fieldName="municipality" />
            <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
          </WithErrorBar>
        )}
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
