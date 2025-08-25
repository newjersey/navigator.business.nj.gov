import { Content } from "@/components/Content";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { StepperStep } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useState } from "react";

interface Props {
  anytimeActionHeaderText?: string;
  CMS_ONLY_stepIndex?: number;
  headerOverride?: ReactElement;
}

export const GovernmentContractingElement = (props: Props): ReactElement => {
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex || 0);
  const { Config } = useConfig();
  let bodyText = "";
  let ctaText = "";
  let ctaLink = "";

  switch (stepIndex) {
    case 0: {
      bodyText = Config.governmentContracting.stepOneContent;
      ctaLink = Config.governmentContracting.stepOneButtonLink;
      ctaText = Config.governmentContracting.stepOneButtonText;
      break;
    }
    case 1: {
      bodyText = Config.governmentContracting.stepTwoContent;
      ctaLink = Config.governmentContracting.stepTwoButtonLink;
      ctaText = Config.governmentContracting.stepTwoButtonText;
      break;
    }
    case 2: {
      bodyText = Config.governmentContracting.stepThreeContent;
      ctaLink = Config.governmentContracting.stepThreeButtonLink;
      ctaText = Config.governmentContracting.stepThreeButtonText;
      break;
    }
    case 3:
      {
        bodyText = Config.governmentContracting.stepFourContent;
        ctaLink = Config.governmentContracting.stepFourButtonLink;
        ctaText = Config.governmentContracting.stepFourButtonText;
        break;
      }
      bodyText = "";
      ctaLink = "";
      ctaText = "";
  }

  const stepperSteps: StepperStep[] = [
    {
      name: Config.governmentContracting.stepOneStepperLabel,
      hasError: false,
      isComplete: stepIndex > 0,
    },
    {
      name: Config.governmentContracting.stepTwoStepperLabel,
      hasError: false,
      isComplete: stepIndex > 1,
    },
    {
      name: Config.governmentContracting.stepThreeStepperLabel,
      hasError: false,
      isComplete: stepIndex > 2,
    },
    {
      name: Config.governmentContracting.stepFourStepperLabel,
      hasError: false,
      isComplete: stepIndex > 3,
    },
  ];

  const extraMargin = props.anytimeActionHeaderText ? "margin-x-4" : "";

  return (
    <div className="flex flex-column space-between min-height-38rem">
      <div
        className={
          props.anytimeActionHeaderText
            ? `bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg`
            : ""
        }
      >
        {props.headerOverride && props.headerOverride}
        {props.anytimeActionHeaderText && (
          <div className="padding-y-4 margin-x-4 margin-bottom-2">
            <h1>{props.anytimeActionHeaderText}</h1>
          </div>
        )}
        <div className="bg-white">
          <div className={`margin-top-3 ${extraMargin}`}>
            <HorizontalStepper
              steps={stepperSteps}
              currentStep={stepIndex}
              onStepClicked={(step: number): void => {
                setStepIndex(step);
              }}
            />
          </div>
          <div className={`${extraMargin} padding-bottom-1`}>
            <Content>{bodyText}</Content>
            {ctaText && ctaLink && (
              <SingleCtaLink
                link={ctaLink}
                text={ctaText}
                buttonColor={"outline"}
                noBackgroundColor={true}
                alignLeft={true}
              />
            )}
          </div>
        </div>
      </div>
      <CtaContainer>
        <ActionBarLayout>
          {stepIndex > 0 && (
            <div
              className={`${
                stepIndex === 3 ? "margin-top-0" : "margin-top-2"
              } mobile-lg:margin-top-0`}
            >
              <SecondaryButton
                isColor="primary"
                onClick={(): void => {
                  setStepIndex(stepIndex - 1);
                }}
                isRightMarginRemoved={stepIndex === 3}
              >
                {Config.governmentContracting.backButtonLabel}
              </SecondaryButton>
            </div>
          )}
          {stepIndex < 3 && (
            <PrimaryButton
              isColor="primary"
              onClick={(): void => {
                setStepIndex(stepIndex + 1);
              }}
              isRightMarginRemoved={true}
            >
              {Config.governmentContracting.continueButtonLabel}
            </PrimaryButton>
          )}
        </ActionBarLayout>
      </CtaContainer>
    </div>
  );
};
