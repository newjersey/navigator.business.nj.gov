import { Button } from "@/components/njwds-extended/Button";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { getFlow, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useRouter } from "next/router";
import { ReactNode, useContext, useState } from "react";

interface Props {
  children: ReactNode;
}

export const DeferredOnboardingQuestion = (props: Props) => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { userData, updateQueue } = useUserData();
  const { Config } = useConfig();
  const { setRoadmap } = useContext(RoadmapContext);
  const router = useRouter();

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    setProfileData(userData.profileData);
  }, userData);

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
    routeShallowWithQuery(router, QUERIES.deferredQuestionAnswered, "true");
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: getFlow(profileData),
          municipalities: [],
        },
        setUser: () => {},
        setProfileData,
        onBack: () => {},
      }}
    >
      <div className="radius-md border-primary-light border-1px padding-3 display-flex mobile-lg:flex-row flex-column mobile-lg:flex-align-center">
        <div>{props.children}</div>
        <Button
          style="secondary"
          className="margin-left-auto mobile-lg:margin-top-0 margin-top-2"
          onClick={onSave}
          dataTestid="deferred-question-save"
        >
          {Config.dashboardDefaults.deferredOnboardingSaveButtonText}
        </Button>
      </div>
    </ProfileDataContext.Provider>
  );
};
