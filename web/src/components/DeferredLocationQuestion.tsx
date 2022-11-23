import { Content } from "@/components/Content";
import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { templateEval } from "@/lib/utils/helpers";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, ReactNode, useContext, useState } from "react";

interface Props {
  innerContent: string;
  CMS_ONLY_showSuccessBanner?: boolean;
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
}

export const DeferredLocationQuestion = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const userDataFromHook = useUserData();
  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;
  const updateQueue = userDataFromHook.updateQueue;

  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(
    props.CMS_ONLY_showSuccessBanner ?? false
  );
  const [showEditLocation, setShowEditLocation] = useState<boolean>(false);
  const { setRoadmap } = useContext(RoadmapContext);

  const label = (
    <>
      <div className="text-bold margin-bottom-2">{Config.deferredLocation.header}</div>
      <Content>{Config.deferredLocation.description}</Content>
    </>
  );

  const shouldShowQuestion = userData?.profileData.municipality === undefined || showEditLocation;

  const onSaveNewLocation = () => {
    setShowSuccessBanner(true);
    setShowEditLocation(false);
    analytics.event.task_location_question.submit.location_entered_for_first_time();
  };

  const onRemoveLocation = async () => {
    if (!updateQueue || !userData) {
      return;
    }

    const newProfileData = { ...userData.profileData, municipality: undefined };

    await updateQueue.queueProfileData(newProfileData).update();

    setAnalyticsDimensions(newProfileData);
    const newRoadmap = await buildUserRoadmap(newProfileData);
    setRoadmap(newRoadmap);
  };

  const successBanner = (): ReactNode => {
    if (!userData?.profileData.municipality) {
      return <></>;
    }
    return (
      <Alert variant="success" dataTestid="city-success-banner">
        <div className="desktop:display-flex flex-row">
          <div className="margin-right-1">
            <Content>
              {templateEval(Config.deferredLocation.successText, {
                city: userData.profileData.municipality.displayName,
              })}
            </Content>
          </div>
          <Button
            style="tertiary"
            underline
            onClick={() => {
              setShowEditLocation(true);
            }}
          >
            {Config.deferredLocation.editText}
          </Button>
          <span className="margin-x-105">|</span>
          <Button
            style="tertiary"
            underline
            onClick={() => {
              onRemoveLocation();
            }}
          >
            {Config.deferredLocation.removeText}
          </Button>
        </div>
      </Alert>
    );
  };

  return (
    <div className="bg-base-extra-light margin-top-2" data-testid="deferred-location-task">
      {shouldShowQuestion ? (
        <DeferredOnboardingQuestion
          label={label}
          onSave={() => {
            return onSaveNewLocation();
          }}
          removeStyling
        >
          <OnboardingMunicipality
            onValidation={() => {}}
            fieldStates={createProfileFieldErrorMap()}
            hideErrorLabel={true}
          />
        </DeferredOnboardingQuestion>
      ) : (
        <div className="padding-3">
          {showSuccessBanner && successBanner()}
          <Content>{props.innerContent}</Content>
        </div>
      )}
    </div>
  );
};
