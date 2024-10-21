import { Content } from "@/components/Content";
import { MunicipalityField } from "@/components/data-fields/MunicipalityField";
import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, ReactNode, useState } from "react";

interface Props {
  innerContent: string;
  CMS_ONLY_showSuccessBanner?: boolean;
  CMS_ONLY_fakeBusiness?: Business;
}

export const DeferredLocationQuestion = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const updateQueue = userDataFromHook.updateQueue;

  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(
    props.CMS_ONLY_showSuccessBanner ?? false
  );
  const [showEditLocation, setShowEditLocation] = useState<boolean>(false);

  const label = (
    <>
      <div className="text-bold margin-bottom-2">{Config.deferredLocation.header}</div>
      <Content>{Config.deferredLocation.description}</Content>
    </>
  );

  const shouldShowQuestion = business?.profileData.municipality === undefined || showEditLocation;

  const onSaveNewLocation = (): void => {
    setShowSuccessBanner(true);
    setShowEditLocation(false);
    business?.profileData.municipality === undefined &&
      updateQueue?.currentBusiness().profileData.municipality !== undefined &&
      analytics.event.task_location_question.submit.location_entered_for_first_time();
  };

  const onRemoveLocation = async (): Promise<void> => {
    if (!updateQueue) {
      return;
    }
    await updateQueue.queueProfileData({ municipality: undefined }).update();
  };

  const successBanner = (): ReactNode => {
    if (!business?.profileData.municipality) {
      return <></>;
    }
    return (
      <Alert variant="success" dataTestid="city-success-banner">
        <div className="desktop:display-flex flex-row">
          <div className="margin-right-1">
            <Content>
              {templateEval(Config.deferredLocation.successText, {
                city: business.profileData.municipality.displayName,
              })}
            </Content>
          </div>
          <UnStyledButton isUnderline onClick={(): void => setShowEditLocation(true)}>
            {Config.deferredLocation.editText}
          </UnStyledButton>
          <span className="margin-x-105">|</span>
          <UnStyledButton isUnderline onClick={onRemoveLocation}>
            {Config.deferredLocation.removeText}
          </UnStyledButton>
        </div>
      </Alert>
    );
  };

  return (
    <div className="bg-base-extra-light margin-top-2" data-testid="deferred-location-task">
      {shouldShowQuestion ? (
        <DeferredOnboardingQuestion label={label} onSave={onSaveNewLocation} isTaskPage>
          <MunicipalityField hideErrorLabel={true} />
        </DeferredOnboardingQuestion>
      ) : (
        <div data-testid="deferred-location-content" className="padding-3">
          {showSuccessBanner && successBanner()}
          <Content>{props.innerContent}</Content>
        </div>
      )}
    </div>
  );
};
