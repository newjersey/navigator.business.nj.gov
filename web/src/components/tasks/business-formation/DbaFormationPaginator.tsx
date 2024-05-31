import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { FormationHelpButton } from "@/components/njwds-extended/FormationHelpButton";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { DbaFormationSteps } from "@/components/tasks/business-formation/DbaFormationSteps";
import { DbaFormationStepsConfiguration } from "@/components/tasks/business-formation/DbaFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { openInNewTab, scrollToTopOfElement, useMountEffect } from "@/lib/utils/helpers";
import { FormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, ReactNode, useContext, useEffect, useRef, useState } from "react";

export const DbaFormationPaginator = (): ReactElement => {
  const { business, updateQueue } = useUserData();
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { Config } = useConfig();

  const stepperRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  const [showCtaModal, setShowCtaModal] = useState<boolean>(false);

  const [stepperState, setStepperState] = useState(
    DbaFormationStepsConfiguration.map((value, index) => {
      return {
        name: value.name,
        hasError: false,
        isComplete: index === 0,
      };
    })
  );

  useMountEffect(() => {
    isMounted.current = true;
  });

  useEffect(() => {
    if (isMounted.current) {
      scrollToTopOfElement(stepperRef.current, {});
    }
  }, [state.stepIndex]);

  const moveToStep = (stepIndex: number): void => {
    setStepIndex(stepIndex);
  };

  const onPreviousButtonClick = (): void => {
    setStepperState((stepperState) => {
      stepperState[1].isComplete = state.stepIndex !== 2;
      return stepperState;
    });
    moveToStep(state.stepIndex - 1);
  };

  const isDba = business?.profileData.businessName && business.profileData.needsNexusDbaName;

  const onMoveToStep = async (
    stepIndex: number,
    config: { moveType: "NEXT_BUTTON" | "STEPPER" }
  ): Promise<void> => {
    if (!updateQueue) return;
    onStepChangeAnalytics(business?.formationData.formationFormData, stepIndex, config.moveType);
    if (
      config.moveType === "NEXT_BUTTON" &&
      stepIndex === 1 &&
      !isDba &&
      isAuthenticated === IsAuthenticated.FALSE
    ) {
      setShowNeedsAccountModal(true);
      return;
    }
    setStepperState((stepperState) => {
      stepperState[1].isComplete = stepIndex === 2;
      return stepperState;
    });
    updateQueue.queueFormationData({ lastVisitedPageIndex: stepIndex }).update();
    moveToStep(stepIndex);
  };

  const onStepChangeAnalytics = (
    formationFormData: FormationFormData | undefined,
    nextStepIndex: number,
    moveType: "NEXT_BUTTON" | "STEPPER"
  ): void => {
    if (!formationFormData) {
      return;
    }

    if (moveType === "STEPPER" && nextStepIndex === 0) {
      analytics.event.business_formation_name_tab.click.arrive_on_business_formation_name_step();
    }
    if (moveType === "STEPPER" && nextStepIndex === 1) {
      analytics.event.business_formation_dba_resolution_tab.click.arrive_on_business_formation_dba_resolution_step();
    }
    if (moveType === "STEPPER" && nextStepIndex === 2) {
      analytics.event.business_formation_dba_authorization_tab.click.arrive_on_business_formation_dba_authorization_step();
    }
    if (moveType === "NEXT_BUTTON" && nextStepIndex === 1) {
      analytics.event.business_formation_dba_resolution_step_continue_button.click.arrive_on_business_formation_dba_resolution_step();
    }
    if (moveType === "NEXT_BUTTON" && nextStepIndex === 2) {
      analytics.event.business_formation_dba_authorization_step_continue_button.click.arrive_on_business_formation_dba_authorization_step();
    }
  };
  const ForwardButton = (): ReactElement => {
    const getForwardButtonText = (): string => {
      if (isAuthenticated === IsAuthenticated.FALSE && !isDba) {
        return `Register & ${Config.formation.general.initialNextButtonText}`;
      } else {
        return Config.formation.general.initialNextNexusButtonText;
      }
    };

    return (
      <div className={"mobile-lg:margin-top-0 margin-top-1 width-full mobile-lg:width-auto"}>
        <PrimaryButton
          isColor="primary"
          onClick={(): void => {
            onMoveToStep(state.stepIndex + 1, { moveType: "NEXT_BUTTON" });
          }}
          isRightMarginRemoved={true}
          dataTestId="next-button"
        >
          {getForwardButtonText()}
        </PrimaryButton>
      </div>
    );
  };

  const BackButton = (): ReactElement => (
    <div
      className={
        " margin-top-1 mobile-lg:margin-top-0 mobile-lg:margin-right-105 width-full mobile-lg:width-auto"
      }
    >
      <SecondaryButton isColor="primary" onClick={onPreviousButtonClick} isRightMarginRemoved={true}>
        {Config.formation.general.previousButtonText}
      </SecondaryButton>
    </div>
  );

  const displayButtons = (): ReactNode => {
    const nameIsAvailable = isDba
      ? state.dbaBusinessNameAvailability?.status === "AVAILABLE"
      : state.businessNameAvailability?.status === "AVAILABLE";

    if (state.stepIndex === 0 && nameIsAvailable) {
      return (
        <CtaContainer>
          <ActionBarLayout reverseInMobile={true}>
            <FormationHelpButton />
            <ForwardButton />
          </ActionBarLayout>
        </CtaContainer>
      );
    } else if (state.stepIndex === 1) {
      return (
        <CtaContainer>
          <ActionBarLayout reverseInMobile={true}>
            <FormationHelpButton />
            <div className="margin-top-2 mobile-lg:margin-top-0">
              <BackButton />
            </div>
            <ForwardButton />
          </ActionBarLayout>
        </CtaContainer>
      );
    } else if (state.stepIndex === 2) {
      return (
        <CtaContainer>
          <ActionBarLayout reverseInMobile={true}>
            <FormationHelpButton />
            <div className="margin-top-2 mobile-lg:margin-top-0">
              <BackButton />
            </div>
            <a href={state.dbaContent.Authorize.callToActionLink} target="_blank" rel="noreferrer noopener">
              <PrimaryButton
                isColor="primary"
                isRightMarginRemoved={true}
                onClick={(): void => {
                  analytics.event.task_primary_call_to_action.click.open_external_website(
                    state.dbaContent.Authorize.callToActionText ||
                      Config.taskDefaults.defaultCallToActionText,
                    state.dbaContent.Authorize.callToActionLink as string
                  );
                  setShowCtaModal(true);
                }}
              >
                {state.dbaContent.Authorize.callToActionText || Config.taskDefaults.defaultCallToActionText}
              </PrimaryButton>
            </a>
          </ActionBarLayout>
        </CtaContainer>
      );
    }
  };

  return (
    <>
      <div ref={stepperRef}>
        <ModalTwoButton
          isOpen={showCtaModal}
          close={(): void => setShowCtaModal(false)}
          title={Config.DbaFormationTask.dbaCtaModalHeader}
          primaryButtonText={Config.DbaFormationTask.dbaCtaModalContinueButtonText}
          primaryButtonOnClick={(): void => {
            openInNewTab(state.dbaContent.Authorize.callToActionLink);
          }}
          secondaryButtonText={Config.DbaFormationTask.dbaCtaModalCancelButtonText}
        >
          <Content>{Config.DbaFormationTask.dbaCtaModalBody}</Content>
        </ModalTwoButton>
        {DbaFormationStepsConfiguration[state.stepIndex].disableStepper ? (
          <></>
        ) : (
          <div className="margin-top-3">
            <HorizontalStepper
              steps={stepperState}
              currentStep={state.stepIndex}
              onStepClicked={(step: number): void => {
                onMoveToStep(step, { moveType: "STEPPER" });
              }}
            />
          </div>
        )}
      </div>
      <div data-testid="formation-dba-form" className="fg1 flex flex-column space-between">
        {DbaFormationSteps[state.stepIndex].component}
        {displayButtons()}
      </div>
    </>
  );
};
