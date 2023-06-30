import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { getFlow } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  label: ReactNode;
  onSave: (updatedProfileData?: ProfileData) => void;
  isTaskPage?: boolean;
}

export const DeferredOnboardingQuestion = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { userData, updateQueue } = useUserData();
  const { Config } = useConfig();

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap());

  useEffect(() => {
    if (!userData) {
      return;
    }
    setProfileData(userData.profileData);
  }, [userData]);

  FormFuncWrapper(async () => {
    if (!updateQueue || !userData) {
      return;
    }
    const profileDataHasNotChanged = JSON.stringify(profileData) === JSON.stringify(userData.profileData);
    if (profileDataHasNotChanged) {
      return;
    }

    await updateQueue.queueProfileData(profileData).update();

    props.onSave(profileData);
  });

  const onTaskPage = (
    <div className="padding-3">
      {props.label}
      <div className="display-flex mobile-lg:flex-row flex-column mobile-lg:flex-align-center">
        <div className="width-100 margin-right-1 form-input margin-bottom-2">{props.children}</div>
        <SecondaryButton isColor="primary" onClick={onSubmit} dataTestId="deferred-question-save">
          {Config.deferredLocation.deferredOnboardingSaveButtonText}
        </SecondaryButton>
      </div>
    </div>
  );

  const onDashboard = (
    <div className="radius-md border-primary-light border-1px padding-3">
      <div className="display-flex mobile-lg:flex-row flex-column mobile-lg:flex-justify">
        <div>
          <div>{props.label}</div>
          <div className="width-100 margin-right-1 form-input">{props.children}</div>
        </div>
        <div className="flex flex-align-center">
          <div className="mobile-lg:margin-top-0 margin-top-2">
            <SecondaryButton
              isColor="primary"
              onClick={onSubmit}
              dataTestId="deferred-question-save"
              isRightMarginRemoved={true}
            >
              {Config.deferredLocation.deferredOnboardingSaveButtonText}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <profileFormContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: getFlow(profileData),
          },
          setUser: (): void => {},
          setProfileData,
          onBack: (): void => {},
        }}
      >
        {props.isTaskPage ? onTaskPage : onDashboard}
      </ProfileDataContext.Provider>
    </profileFormContext.Provider>
  );
};
