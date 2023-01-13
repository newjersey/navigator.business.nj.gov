import { Button } from "@/components/njwds-extended/Button";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getFlow } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  label: ReactNode;
  onSave: () => void;
  isTaskPage?: boolean;
}

export const DeferredOnboardingQuestion = (props: Props) => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { userData, updateQueue } = useUserData();
  const { Config } = useConfig();

  useEffect(() => {
    if (!userData) {
      return;
    }
    setProfileData(userData.profileData);
  }, [userData]);

  const onSave = async () => {
    if (!updateQueue || !userData) {
      return;
    }
    const profileDataHasNotChanged = JSON.stringify(profileData) === JSON.stringify(userData.profileData);
    if (profileDataHasNotChanged) {
      return;
    }

    await updateQueue.queueProfileData(profileData).update();

    props.onSave();
  };

  const onTaskPage = (
    <div className="padding-3">
      {props.label}
      <div className="display-flex mobile-lg:flex-row flex-column mobile-lg:flex-align-center">
        <div className="width-100 margin-right-1 form-input">{props.children}</div>
        <Button
          style="secondary"
          className="margin-top-2"
          onClick={onSave}
          dataTestid="deferred-question-save"
        >
          {Config.deferredLocation.deferredOnboardingSaveButtonText}
        </Button>
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
          <Button
            style="secondary"
            className="mobile-lg:margin-top-0 margin-top-2"
            onClick={onSave}
            dataTestid="deferred-question-save"
            noRightMargin
          >
            {Config.deferredLocation.deferredOnboardingSaveButtonText}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: getFlow(profileData),
        },
        setUser: () => {},
        setProfileData,
        onBack: () => {},
      }}
    >
      {props.isTaskPage ? onTaskPage : onDashboard}
    </ProfileDataContext.Provider>
  );
};
