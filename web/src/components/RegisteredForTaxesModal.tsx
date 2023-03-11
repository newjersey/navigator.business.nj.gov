import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { ProfileNexusDBANameField } from "@/components/onboarding/ProfileNexusDBANameField";
import { OnboardingTaxId } from "@/components/onboarding/taxId/OnboardingTaxId";
import { TaxDisclaimer } from "@/components/TaxDisclaimer";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap } from "@/lib/types/types";
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

  const {
    FormFuncWrapper,
    onSubmit,
    isValid,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap());

  useEffect(() => {
    if (!userData) {
      return;
    }
    setProfileData(userData.profileData);
  }, [userData]);

  FormFuncWrapper(() => {
    if (!userData || !updateQueue || !isValid()) {
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
  });

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
    if (userData.profileData.nexusLocationInNewJersey === false) {
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
    <profileFormContext.Provider value={formContextState}>
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
              <WithErrorBar hasError={formContextState.fieldStates.nexusDbaName.invalid} type="ALWAYS">
                <FieldLabelModal fieldName="nexusDbaName" />
                <ProfileNexusDBANameField required />
              </WithErrorBar>
            </>
          )}
          {showBusinessField() && (
            <WithErrorBar hasError={formContextState.fieldStates.businessName.invalid} type="ALWAYS">
              <FieldLabelModal fieldName="businessName" />
              <OnboardingBusinessName required />
            </WithErrorBar>
          )}

          <WithErrorBar hasError={formContextState.fieldStates.taxId.invalid} type="ALWAYS">
            <FieldLabelModal fieldName="taxId" />
            <TaxDisclaimer legalStructureId={userData?.profileData.legalStructureId} />
            <OnboardingTaxId required />
          </WithErrorBar>

          <FieldLabelModal fieldName="ownershipTypeIds" />
          <OnboardingOwnership />

          <div className="margin-top-3" aria-hidden={true} />
          <WithErrorBar hasError={formContextState.fieldStates.existingEmployees.invalid} type="ALWAYS">
            <FieldLabelModal fieldName="existingEmployees" />
            <OnboardingExistingEmployees required />
          </WithErrorBar>

          {showMunicipalityField() && (
            <WithErrorBar hasError={formContextState.fieldStates.municipality.invalid} type="ALWAYS">
              <FieldLabelModal fieldName="municipality" />
              <OnboardingMunicipality required />
            </WithErrorBar>
          )}
        </ModalTwoButton>
      </ProfileDataContext.Provider>
    </profileFormContext.Provider>
  );
};
