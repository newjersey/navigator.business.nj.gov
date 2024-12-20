import { Content } from "@/components/Content";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ReverseOrderInMobile } from "@/components/njwds-layout/ReverseOrderInMobile";
import {
  getAnytimeActionTaskObj,
  GovernmentContractingSteps,
  shouldDisplayContinueButton,
  shouldDisplayPreviousButton,
} from "@/components/tasks/government-contracting/GovernmentContractingSteps";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { AnytimeActionTask } from "@/lib/types/types";
import { scrollToTopOfElement, useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";

export const GovernmentContractorPaginator = (): ReactElement<any> => {
  const stepperRef = useRef<HTMLDivElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [anytimeActionTask, setAnytimeActionTask] = useState<AnytimeActionTask>();
  const { Config } = useConfig();
  const isMounted = useRef(false);

  useMountEffect(() => {
    isMounted.current = true;
  });

  useEffect(() => {
    getAnytimeActionTaskObj(stepIndex).then((anytimeActionTask) => {
      setAnytimeActionTask(anytimeActionTask);
    });

    if (isMounted.current) {
      scrollToTopOfElement(stepperRef.current, {});
    }
  }, [stepIndex]);

  const onMoveToStep = (stepIndex: number): void => {
    setStepIndex(stepIndex);
  };

  const getNextButtonText = (stepIndex: number): string => {
    if (stepIndex === GovernmentContractingSteps.length - 1) {
      return Config.taskDefaults.backButtonText;
    } else {
      return Config.taskDefaults.continueButtonText;
    }
  };

  const displayButtons = (): ReactNode => {
    return (
      <div className="margin-top-2 ">
        <div className="bg-base-lightest padding-3 margin-top-3 margin-bottom-neg-4 radius-bottom-lg">
          <ReverseOrderInMobile className={"flex-justify-end"}>
            <>
              {shouldDisplayPreviousButton(stepIndex) && (
                <div className="margin-top-1 mobile-lg:margin-top-0 mobile-lg:margin-right-105">
                  <SecondaryButton
                    isColor="primary"
                    onClick={(): void => {
                      onMoveToStep(stepIndex - 1);
                    }}
                    dataTestId="previous-button"
                    isRightMarginRemoved={true}
                  >
                    {Config.taskDefaults.backButtonText}
                  </SecondaryButton>
                </div>
              )}
              {shouldDisplayContinueButton(stepIndex) && (
                <PrimaryButton
                  isColor="primary"
                  onClick={(): void => {
                    onMoveToStep(stepIndex + 1);
                  }}
                  isRightMarginRemoved={true}
                  dataTestId="next-button"
                >
                  {getNextButtonText(stepIndex)}
                </PrimaryButton>
              )}
            </>
          </ReverseOrderInMobile>
        </div>
      </div>
    );
  };

  const stepStates = GovernmentContractingSteps.map((value) => {
    return {
      name: value.name,
    };
  });

  return (
    <>
      <div className="margin-top-3 margin-x-4" ref={stepperRef}>
        <HorizontalStepper
          steps={stepStates}
          currentStep={stepIndex}
          onStepClicked={(step: number): void => {
            onMoveToStep(step);
          }}
        />
      </div>
      <div className="fg1 flex flex-column space-between">
        <>
          <div className={"margin-x-4"} data-testid={anytimeActionTask?.name}>
            <Content>{anytimeActionTask?.contentMd ?? ""}</Content>
            {anytimeActionTask?.callToActionLink ? (
              <SingleCtaLink
                link={anytimeActionTask.callToActionLink}
                text={anytimeActionTask?.callToActionText ?? ""}
                buttonColor={"outline"}
                noBackgroundColor={true}
                alignLeft={true}
              />
            ) : (
              <></>
            )}
          </div>
          {displayButtons()}
        </>
      </div>
    </>
  );
};
