import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/";
import { FormControl } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  open: boolean;
  onContinue: () => void;
  handleClose: () => void;
}

export const SectorModal = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const { userData } = useUserData();

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates((prevFieldStates) => {
      return { ...prevFieldStates, [field]: { invalid } };
    });
  };

  const handleClose = () => {
    props.handleClose();
    setFieldStates(createProfileFieldErrorMap());
  };

  const onSubmit = async () => {
    if (!userData) {
      return;
    }
    const errorMap = {
      ...fieldStates,
      sectorId: { invalid: !profileData.sectorId },
    };
    setFieldStates(errorMap);
    if (
      Object.keys(errorMap).some((k) => {
        return errorMap[k as ProfileFields].invalid;
      })
    ) {
      return;
    }

    await props.onContinue();
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: "OWNING",
        },
        setProfileData,
        setUser: () => {},
        onBack: () => {},
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
          <FormControl fullWidth={true}>
            <div className="margin-top-2">
              <FieldLabelModal fieldName="sectorId" />
              <OnboardingSectors onValidation={onValidation} fieldStates={fieldStates} />
            </div>
          </FormControl>
        </div>
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
