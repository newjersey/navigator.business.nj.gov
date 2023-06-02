import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { ProfileDateOfFormation } from "@/components/profile/ProfileDateOfFormation";
import { ProfileMunicipality } from "@/components/profile/ProfileMunicipality";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap } from "@/lib/types/types";
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
  const { business, updateQueue } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());

  const {
    FormFuncWrapper,
    onSubmit,
    isValid,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap());

  useEffect(() => {
    if (!business) return;
    setProfileData(business.profileData);
  }, [business]);

  const shouldShowMunicipalityQuestion = (): boolean => {
    if (!business) {
      return false;
    }
    if (business.profileData.nexusLocationInNewJersey === false) {
      return false;
    }
    return business.profileData.municipality === undefined;
  };

  FormFuncWrapper(() => {
    if (!business || !updateQueue || !isValid()) {
      return;
    }
    analytics.event.formation_date_modal.submit.formation_status_set_to_complete();
    updateQueue.queueProfileData(profileData);

    props.onSave({ redirectOnSuccess: true });
  });

  return (
    <profileFormContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "STARTING",
          },
          setProfileData,
          setUser: (): void => {},
          onBack: (): void => {},
        }}
      >
        <ModalTwoButton
          isOpen={props.isOpen}
          close={props.close}
          title={Config.formationDateModal.header}
          primaryButtonText={Config.formationDateModal.saveButtonText}
          primaryButtonOnClick={onSubmit}
          secondaryButtonText={Config.formationDateModal.cancelButtonText}
        >
          <div className="margin-bottom-3">
            <Content>{Config.formationDateModal.description}</Content>
          </div>
          <WithErrorBar hasError={formContextState.fieldStates.dateOfFormation.invalid} type="ALWAYS">
            <FieldLabelModal
              fieldName="dateOfFormation"
              overrides={{
                header: Config.formationDateModal.fieldLabel,
                description: Config.formationDateModal.fieldDescription,
              }}
            />

            <ProfileDateOfFormation
              required={true}
              disabled={false}
              futureAllowed={true}
              errorTextOverride={Config.formationDateModal.dateOfFormationErrorText}
            />
          </WithErrorBar>
          {shouldShowMunicipalityQuestion() && (
            <WithErrorBar
              hasError={formContextState.fieldStates.municipality.invalid}
              type="ALWAYS"
              className="margin-top-2"
            >
              <FieldLabelModal fieldName="municipality" />
              <ProfileMunicipality required />
            </WithErrorBar>
          )}
        </ModalTwoButton>
      </ProfileDataContext.Provider>
    </profileFormContext.Provider>
  );
};
