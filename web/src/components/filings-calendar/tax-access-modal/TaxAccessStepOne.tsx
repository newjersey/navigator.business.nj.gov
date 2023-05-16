import { TaxAccessModalBody } from "@/components/filings-calendar/tax-access-modal/TaxAccessModalBody";
import { ModalOneButton } from "@/components/ModalOneButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { FieldLabelDescriptionOnly } from "@/components/onboarding/FieldLabelDescriptionOnly";
import { OnboardingLegalStructureDropdown } from "@/components/onboarding/OnboardingLegalStructureDropDown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { FieldStateActionKind } from "@/contexts/formContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createReducedFieldStates, ProfileFields } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useState } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  moveToNextStep: () => void;
}

export const TaxAccessStepOne = (props: Props): ReactElement => {
  const fields: ProfileFields[] = ["legalStructureId"];
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { userData, updateQueue } = useUserData();
  const { Config } = useConfig();

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
    isValid,
  } = useFormContextHelper(createReducedFieldStates(fields));

  FormFuncWrapper(async () => {
    if (!updateQueue) return;
    await updateQueue.queueProfileData(profileData).update();
    props.moveToNextStep();
  });

  const onClose = (): void => {
    if (!userData) return;
    props.close();
    setProfileData(userData.profileData);
    formContextState.reducer({ type: FieldStateActionKind.RESET });
  };

  return (
    <ModalOneButton
      isOpen={props.isOpen}
      close={onClose}
      title={Config.taxAccess.modalHeader}
      primaryButtonText={Config.taxAccess.stepOneNextButton}
      primaryButtonOnClick={onSubmit}
    >
      {!isValid() && <Alert variant="error">{Config.taxAccess.stepOneErrorBanner}</Alert>}

      <TaxAccessModalBody isStepOne={true} showHeader={true} />

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
          <WithErrorBar hasError={!isValid()} type="ALWAYS">
            <FieldLabelDescriptionOnly fieldName="legalStructureId" bold={true} />
            <OnboardingLegalStructureDropdown />
          </WithErrorBar>
        </ProfileDataContext.Provider>
      </profileFormContext.Provider>
    </ModalOneButton>
  );
};
