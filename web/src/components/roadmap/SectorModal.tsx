import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
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
    setFieldStates({ ...fieldStates, [field]: { invalid } });
  };

  const handleClose = () => {
    props.handleClose();
    setFieldStates(createProfileFieldErrorMap());
  };

  const onSubmit = async () => {
    if (!userData) return;
    const errorMap = {
      ...fieldStates,
      sectorId: { invalid: !profileData.sectorId },
    };
    setFieldStates(errorMap);
    if (Object.keys(errorMap).some((k) => errorMap[k as ProfileFields].invalid)) return;

    await props.onContinue();
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: "OWNING",
          municipalities: [],
        },
        setProfileData,
        setUser: () => {},
        onBack: () => {},
      }}
    >
      <ModalTwoButton
        isOpen={props.open}
        close={handleClose}
        title={Config.roadmapDefaults.sectorModalTitle}
        primaryButtonText={Config.roadmapDefaults.sectorModalSaveButton}
        primaryButtonOnClick={onSubmit}
        secondaryButtonText={Config.roadmapDefaults.sectorModalCancelButton}
        maxWidth="md"
        dividers={true}
      >
        <div data-testid="sector-modal" className="padding-top-4">
          <Content>{Config.roadmapDefaults.sectorModalBody}</Content>
          <FormControl fullWidth={true}>
            <div className="margin-top-2">
              <OnboardingSectors onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
            </div>
          </FormControl>
        </div>
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
