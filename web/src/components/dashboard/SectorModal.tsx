import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { OnboardingAndProfileSectors } from "@/components/onboarding-profile-shared/OnboardingAndProfileSectors";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { FieldStateActionKind } from "@/contexts/formContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/";
import { FormControl } from "@mui/material";
import { ReactElement, useState } from "react";
import { WithErrorBar } from "../WithErrorBar";

interface Props {
  open: boolean;
  onContinue: () => void;
  handleClose: () => void;
}

export const SectorModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { updateQueue } = useUserData();
  const userData = updateQueue?.current();

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap());

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

  const handleClose = (): void => {
    props.handleClose();
    formContextState.reducer({ type: FieldStateActionKind.RESET });
  };

  FormFuncWrapper(() => {
    if (!updateQueue) return;
    updateQueue.queueProfileData(profileData);
    props.onContinue();
  });

  return (
    <profileFormContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "OWNING",
          },
          setProfileData,
          setUser: (): void => {},
          onBack: (): void => {},
        }}
      >
        <ModalTwoButton
          isOpen={props.open}
          close={handleClose}
          title={Config.dashboardDefaults.sectorModalTitle}
          primaryButtonText={Config.dashboardDefaults.sectorModalSaveButton}
          primaryButtonOnClick={onSubmit}
          secondaryButtonText={Config.dashboardDefaults.sectorModalCancelButton}
          maxWidth="md"
        >
          <div data-testid="sector-modal" className="padding-top-4">
            <Content>{Config.dashboardDefaults.sectorModalBody}</Content>
            <div className="margin-top-2" />
            <WithErrorBar hasError={formContextState.fieldStates.sectorId.invalid} type="ALWAYS">
              <FormControl fullWidth={true}>
                <FieldLabelModal fieldName="sectorId" />
                <OnboardingAndProfileSectors isSectorModal={true} />
              </FormControl>
            </WithErrorBar>
          </div>
        </ModalTwoButton>
      </ProfileDataContext.Provider>
    </profileFormContext.Provider>
  );
};
