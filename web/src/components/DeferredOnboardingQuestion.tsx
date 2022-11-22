import { Button } from "@/components/njwds-extended/Button";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { getFlow } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactNode, useContext, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  label: ReactNode;
  onSave: () => void;
  removeStyling?: boolean;
}

export const DeferredOnboardingQuestion = (props: Props) => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { userData, updateQueue } = useUserData();
  const { Config } = useConfig();
  const { setRoadmap } = useContext(RoadmapContext);

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

    setAnalyticsDimensions(profileData);
    const newRoadmap = await buildUserRoadmap(profileData);
    setRoadmap(newRoadmap);
    props.onSave();
  };

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
      <div className={`${props.removeStyling ? "" : "radius-md border-primary-light border-1px"} padding-3`}>
        {props.label}
        <div className="display-flex mobile-lg:flex-row flex-column mobile-lg:flex-align-center margin-top-2">
          <div className="width-100 margin-right-1 form-input">{props.children}</div>
          <Button
            style="secondary"
            className="mobile-lg:margin-top-0 margin-top-2"
            onClick={onSave}
            dataTestid="deferred-question-save"
          >
            {Config.deferredLocation.deferredOnboardingSaveButtonText}
          </Button>
        </div>
      </div>
    </ProfileDataContext.Provider>
  );
};
