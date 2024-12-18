import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ReverseOrderInMobile } from "@/components/njwds-layout/ReverseOrderInMobile";
import {
  TaxClearanceCertificateSteps,
  shouldDisplaySaveAndContinueButton,
  shouldDisplayPreviousButton, shouldDisplayContinueButton, getAnytimeActionTaskObj
} from "@/components/tasks/tax-clearance-certificate/TaxClearanceCertificateSteps";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { scrollToTopOfElement, useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import {
  TaxClearanceCertificateEligibility
} from "@/components/tasks/tax-clearance-certificate/TaxClearanceCertificateEligibility";
import {useFormContextHelper} from "@/lib/data-hooks/useFormContextHelper";
import {AnytimeActionTask, createProfileFieldErrorMap} from "@/lib/types/types";
import {
  TaxClearanceCertificateReview
} from "@/components/tasks/tax-clearance-certificate/TaxClearanceCertificateReview";
import {Content} from "@/components/Content";
import {SingleCtaLink} from "@/components/njwds-extended/cta/SingleCtaLink";
import {emptyFormationAddressData, FormationAddress} from "@businessnjgovnavigator/shared/formationData";
import {TaxCertificateContext} from "@/contexts/taxCertificateContext";
import {FormationHelpButton} from "@/components/njwds-extended/FormationHelpButton";


export const TaxClearanceCertificatePaginator = (): ReactElement => {
  const stepperRef = useRef<HTMLDivElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const {Config} = useConfig();
  const isMounted = useRef(false);
  const [anytimeActionTask, setAnytimeActionTask] = useState<AnytimeActionTask>();
  const [formationAddressData, setAddressData] = useState<FormationAddress>(emptyFormationAddressData);


  const {
    FormFuncWrapper,
  } = useFormContextHelper(createProfileFieldErrorMap());

  useMountEffect(() => {
    isMounted.current = true;
  });

  useEffect(() => {
    if (isMounted.current) {
      scrollToTopOfElement(stepperRef.current, {});
    }

    getAnytimeActionTaskObj().then((anytimeActionTask) => {
      setAnytimeActionTask(anytimeActionTask);
    });
  }, [stepIndex]);

  const onMoveToStep = (stepIndex: number): void => {
    if(stepIndex!==TaxClearanceCertificateSteps.length) {
      setStepIndex(stepIndex);
    }
  };

  const displayButtons = (): ReactNode => {
    return (
      <div className="margin-top-2 ">
        <div className="bg-base-lightest padding-3 margin-top-3 margin-bottom-neg-4 radius-bottom-lg">
          <ReverseOrderInMobile className={"flex-justify-end"}>
            <>
              <FormationHelpButton />
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
                  dataTestId="continue-button"
                >
                  {Config.taskDefaults.continueButtonText}
                </PrimaryButton>
              )}
              {shouldDisplaySaveAndContinueButton(stepIndex) && (
                <PrimaryButton
                  isColor="primary"
                  onClick={(): void => {
                    onMoveToStep(stepIndex+1);
                  }}
                  isRightMarginRemoved={true}
                  dataTestId="save-continue-button"
                >
                  {Config.taskDefaults.saveAndContinueButtonText}
                </PrimaryButton>
              )}
            </>
          </ReverseOrderInMobile>
        </div>
      </div>
    );
  };

  const stepStates = TaxClearanceCertificateSteps.map((value) => {
    return {
      name: value.name,
    };
  });

  FormFuncWrapper(() => {

  });


  const renderContent = (stepName: string): ReactElement => {
    switch (stepName) {
      case "Requirements":
        return (<>
          <Content>{anytimeActionTask?.contentMd ?? ""}</Content>
          {anytimeActionTask?.callToActionLink ? (
            <SingleCtaLink
              link={anytimeActionTask?.callToActionLink}
              text={anytimeActionTask?.callToActionText ?? ""}
              buttonColor={"outline"}
              noBackgroundColor={true}
              alignLeft={true}
            />
          ) : (
            <></>
          )}
        </>);
      case "Check Eligibility":
        return <TaxClearanceCertificateEligibility />;
      case "Review":
        return <TaxClearanceCertificateReview />;
      default:
        return <></>;
    }
  }

  return (
    <>
      <TaxCertificateContext.Provider value={{
        state: { formationAddressData },
        setAddressData,
      }}>
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
          <div className={"margin-x-4"} data-testid={stepStates[stepIndex].name}>
            {renderContent(stepStates[stepIndex].name)}
          </div>
          {displayButtons()}
        </>
      </div>
      </TaxCertificateContext.Provider>
    </>
  );
};
