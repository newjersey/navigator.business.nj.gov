import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSave: ({ redirectOnSuccess }: { redirectOnSuccess: boolean }) => void;
}

export const FormationDateModal = (props: Props): ReactElement => {
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
    setFieldStates({ ...fieldStates, [field]: { invalid } });
  };

  const saveDateOfFormation = async (): Promise<void> => {
    if (!userData || !updateQueue) {
      return;
    }
    if (!profileData.dateOfFormation || fieldStates.dateOfFormation.invalid) {
      onValidation("dateOfFormation", true);
      return;
    }
    if (!profileData.municipality || fieldStates.municipality.invalid) {
      onValidation("municipality", true);
      return;
    }
    analytics.event.formation_date_modal.submit.formation_status_set_to_complete();
    updateQueue.queueProfileData(profileData);

    props.onSave({ redirectOnSuccess: true });
  };

  const shouldShowMunicipalityQuestion = (): boolean => {
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
        title={Config.formationDateModal.header}
        primaryButtonText={Config.formationDateModal.saveButtonText}
        primaryButtonOnClick={saveDateOfFormation}
        secondaryButtonText={Config.formationDateModal.cancelButtonText}
      >
        <div className="margin-bottom-3">
          <Content>{Config.formationDateModal.description}</Content>
        </div>
        <FieldLabelModal
          fieldName="dateOfFormation"
          overrides={{
            header: Config.formationDateModal.fieldLabel,
            description: Config.formationDateModal.fieldDescription,
          }}
        />
        <OnboardingDateOfFormation
          onValidation={onValidation}
          fieldStates={fieldStates}
          required={true}
          disabled={false}
          futureAllowed={true}
          errorTextOverride={Config.formationDateModal.dateOfFormationErrorText}
        />
        {shouldShowMunicipalityQuestion() && (
          <>
            <FieldLabelModal fieldName="municipality" />
            <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
          </>
        )}
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
