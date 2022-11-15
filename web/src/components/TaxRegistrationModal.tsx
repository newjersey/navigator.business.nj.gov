import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import {
  createEmptyProfileData,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { ReactElement, useContext, useEffect, useState } from "react";
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
  const { setRoadmap } = useContext(RoadmapContext);

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
      businessName: {
        invalid: !profileData.businessName && showBusinessField(),
      },
      existingEmployees: {
        invalid: !profileData.existingEmployees,
      },
      taxId: {
        invalid: profileData.taxId?.length !== 12 && showTaxIdField(),
      },
      municipality: {
        invalid: !profileData.municipality && showMunicipalityField(),
      },
    };
    setFieldStates(errorMap);
    if (
      Object.keys(errorMap).some((k) => {
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

    const newRoadmap = await buildUserRoadmap(profileData);
    setRoadmap(newRoadmap);
    setAnalyticsDimensions(profileData);

    props.onSave({ redirectOnSuccess: true });
    props.close();
  };

  const showBusinessField = (): boolean => {
    return (
      userData?.profileData.businessName === "" &&
      LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling
    );
  };

  const showTaxIdField = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling;
  };

  const showMunicipalityField = (): boolean => {
    if (!userData) {
      return false;
    }
    return userData.profileData.municipality === undefined;
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
          <>
            <FieldLabelModal fieldName="businessName" />
            <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} required />
          </>
        )}
        {showTaxIdField() && (
          <>
            <FieldLabelModal fieldName="taxId" />
            <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} required />
          </>
        )}

        <FieldLabelModal fieldName="ownershipTypeIds" />
        <OnboardingOwnership />

        <div className="margin-top-3" aria-hidden={true} />

        <FieldLabelModal fieldName="existingEmployees" />
        <OnboardingExistingEmployees onValidation={onValidation} fieldStates={fieldStates} />

        {showMunicipalityField() && (
          <>
            <FieldLabelModal fieldName="municipality" />
            <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
          </>
        )}
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
