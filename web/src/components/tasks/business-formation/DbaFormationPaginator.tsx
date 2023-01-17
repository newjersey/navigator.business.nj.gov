import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Button } from "@/components/njwds-extended/Button";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaskCTA } from "@/components/TaskCTA";
import { DbaFormationSteps } from "@/components/tasks/business-formation/DbaFormationSteps";
import { DbaFormationStepsConfiguration } from "@/components/tasks/business-formation/DbaFormationStepsConfiguration";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { scrollToTopOfElement } from "@/lib/utils/helpers";
import { FormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode, useContext, useEffect, useRef, useState } from "react";

export const DbaFormationPaginator = (): ReactElement => {
  const { userData } = useUserData();
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const { Config } = useConfig();

  const stepperRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);
  const isDesktop = useMediaQuery(MediaQueries.desktopAndUp);
  const [showCtaModal, setShowCtaModal] = useState<boolean>(false);

  const [stepperState, setStepperState] = useState(
    DbaFormationStepsConfiguration.map((value, index) => {
      return {
        name: value.name,
        hasError: false,
        isComplete: index == 0,
      };
    })
  );

  useEffect(() => {
    if (isMounted.current) {
      scrollToTopOfElement(stepperRef.current, { isDesktop });
    }
  }, [state.stepIndex, isDesktop]);

  const moveToStep = (stepIndex: number): void => {
    setStepIndex(stepIndex);
  };

  const onPreviousButtonClick = (): void => {
    setStepperState((stepperState) => {
      stepperState[1].isComplete = state.stepIndex != 2;
      return stepperState;
    });
    moveToStep(state.stepIndex - 1);
  };

  const isNotDba =
    userData?.profileData.businessName && userData.profileData.nexusDbaName == emptyProfileData.nexusDbaName;

  const onMoveToStep = async (
    stepIndex: number,
    config: { moveType: "NEXT_BUTTON" | "STEPPER" }
  ): Promise<void> => {
    onStepChangeAnalytics(userData?.formationData.formationFormData, stepIndex, config.moveType);
    if (
      config.moveType == "NEXT_BUTTON" &&
      stepIndex == 1 &&
      isNotDba &&
      isAuthenticated === IsAuthenticated.FALSE
    ) {
      setRegistrationModalIsVisible(true);
      return;
    }
    setStepperState((stepperState) => {
      stepperState[1].isComplete = stepIndex == 2;
      return stepperState;
    });
    moveToStep(stepIndex);
  };

  const onStepChangeAnalytics = (
    formationFormData: FormationFormData | undefined,
    nextStepIndex: number,
    moveType: "NEXT_BUTTON" | "STEPPER"
  ) => {
    if (!formationFormData) {
      return;
    }

    if (moveType === "STEPPER" && nextStepIndex == 0) {
      analytics.event.business_formation_name_tab.click.arrive_on_business_formation_name_step();
    }
    if (moveType === "STEPPER" && nextStepIndex == 1) {
      analytics.event.business_formation_dba_resolution_tab.click.arrive_on_business_formation_dba_resolution_step();
    }
    if (moveType === "STEPPER" && nextStepIndex == 2) {
      analytics.event.business_formation_dba_authorization_tab.click.arrive_on_business_formation_dba_authorization_step();
    }
    if (moveType === "NEXT_BUTTON" && nextStepIndex == 1) {
      analytics.event.business_formation_dba_resolution_step_continue_button.click.arrive_on_business_formation_dba_resolution_step();
    }
    if (moveType === "NEXT_BUTTON" && nextStepIndex == 2) {
      analytics.event.business_formation_dba_authorization_step_continue_button.click.arrive_on_business_formation_dba_authorization_step();
    }
  };
  const ForwardButton = () => {
    const getForwardButtonText = () => {
      if (isAuthenticated === IsAuthenticated.FALSE && isNotDba) {
        return `Register & ${Config.businessFormationDefaults.initialNextButtonText}`;
      } else {
        return Config.businessFormationDefaults.initialNextNexusButtonText;
      }
    };

    return (
      <Button
        style="primary"
        onClick={() => {
          return onMoveToStep(state.stepIndex + 1, { moveType: "NEXT_BUTTON" });
        }}
        widthAutoOnMobile
        noRightMargin
        dataTestid="next-button"
      >
        {getForwardButtonText()}
      </Button>
    );
  };

  const BackButton = () => (
    <Button style="secondary" widthAutoOnMobile onClick={onPreviousButtonClick}>
      {Config.businessFormationDefaults.previousButtonText}
    </Button>
  );

  const ButtonWrapper = (props: { children: ReactNode }) => {
    return (
      <div className="margin-top-2">
        <div className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4">
          {props.children}
        </div>
      </div>
    );
  };

  const displayButtons = () => {
    if (state.stepIndex == 0 && state.businessNameAvailability?.status == "AVAILABLE") {
      return (
        <ButtonWrapper>
          <ForwardButton />
        </ButtonWrapper>
      );
    } else if (state.stepIndex == 1) {
      return (
        <ButtonWrapper>
          <BackButton />
          <ForwardButton />
        </ButtonWrapper>
      );
    } else if (state.stepIndex == 2) {
      return (
        <TaskCTA
          link={state.dbaContent.Authorize.callToActionLink}
          text={state.dbaContent.Authorize.callToActionText}
          onClick={() => {
            return setShowCtaModal(true);
          }}
        >
          <BackButton />
        </TaskCTA>
      );
    }
  };

  return (
    <>
      <div ref={stepperRef}>
        <ModalTwoButton
          isOpen={showCtaModal}
          close={() => {
            return setShowCtaModal(false);
          }}
          title={Config.DbaFormationTask.dbaCtaModalHeader}
          primaryButtonText={Config.DbaFormationTask.dbaCtaModalContinueButtonText}
          primaryButtonOnClick={() => {
            return window.open(state.dbaContent.Authorize.callToActionLink, "_ blank");
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
              onStepClicked={(step: number) => {
                return onMoveToStep(step, { moveType: "STEPPER" });
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
