import { Content } from "@/components/Content";
import { DialogTwoButton } from "@/components/DialogTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import {
  createProfileFieldErrorMap,
  ProfileFieldErrorMap,
  ProfileFields,
  TaskProgress,
} from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSave: (newValue: TaskProgress, userData: UserData) => void;
}

export const FormationDateModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const router = useRouter();
  const { userData } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());

  useEffect(() => {
    if (!userData) return;
    setProfileData(userData.profileData);
  }, [userData]);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates({ ...fieldStates, [field]: { invalid } });
  };

  const saveDateOfFormation = (): void => {
    if (!userData) return;
    if (!profileData.dateOfFormation || fieldStates.dateOfFormation.invalid) {
      onValidation("dateOfFormation", true);
      return;
    }
    const updatedUserData = { ...userData, profileData };
    props.onSave("COMPLETED", updatedUserData);
    router.push(routeForPersona(userData.profileData.businessPersona));
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: "STARTING",
          municipalities: [],
        },
        setProfileData,
        setUser: () => {},
        onBack: () => {},
      }}
    >
      <DialogTwoButton
        isOpen={props.isOpen}
        close={props.close}
        title={Config.formationDateModal.header}
        primaryButtonText={Config.formationDateModal.saveButtonText}
        primaryButtonOnClick={saveDateOfFormation}
        secondaryButtonText={Config.formationDateModal.cancelButtonText}
      >
        <Content>{Config.formationDateModal.description}</Content>
        <Alert variant="warning">{Config.formationDateModal.warningText}</Alert>
        <OnboardingDateOfFormation
          onValidation={onValidation}
          fieldStates={fieldStates}
          required={true}
          disabled={userData?.formationData.getFilingResponse?.success}
          headerAriaLevel={3}
          configOverrides={{
            header: Config.formationDateModal.fieldLabel,
            description: Config.formationDateModal.fieldDescription,
            errorText: Config.formationDateModal.errorText,
          }}
        />
      </DialogTwoButton>
    </ProfileDataContext.Provider>
  );
};
