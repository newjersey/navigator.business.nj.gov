import { Content } from "@/components/Content";
import { Sectors } from "@/components/data-fields/Sectors";
import { FieldLabelModal } from "@/components/field-labels/FieldLabelModal";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { WithErrorBar } from "@/components/WithErrorBar";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FieldStateActionKind } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  createEmptyProfileData,
  ProfileData,
} from "@businessnjgovnavigator/shared/";
import { FormControl } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  open: boolean;
  onContinue: () => void;
  handleClose: () => void;
}

export const SectorModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [profileData, setProfileData] = useState<ProfileData>(
    createEmptyProfileData()
  );
  const { updateQueue, business } = useUserData();

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  useMountEffectWhenDefined(() => {
    if (business) {
      setProfileData(business.profileData);
    }
  }, business);

  const handleClose = (): void => {
    props.handleClose();
    formContextState.reducer({ type: FieldStateActionKind.RESET });
  };

  FormFuncWrapper(async () => {
    if (!updateQueue) return;
    updateQueue.queueProfileData(profileData);
    await updateQueue.update();
    props.onContinue();
  });

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "OWNING",
          },
          setProfileData,
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
        >
          <div data-testid="sector-modal">
            <div className="margin-y-3">
              <Content>{Config.dashboardDefaults.sectorModalBody}</Content>
            </div>
            <hr className="margin-y-4" />
            <WithErrorBar
              hasError={formContextState.fieldStates.sectorId.invalid}
              type="ALWAYS"
            >
              <FormControl fullWidth={true}>
                <FieldLabelModal fieldName="sectorId" />
                <Sectors isSectorModal={true} />
              </FormControl>
            </WithErrorBar>
          </div>
        </ModalTwoButton>
      </ProfileDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
