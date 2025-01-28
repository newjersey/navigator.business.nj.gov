import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import {ReactElement, useState} from "react";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {HorizontalStepper} from "@/components/njwds-extended/HorizontalStepper";
import { Content } from "@/components/Content";
import {HorizontalLine} from "@/components/HorizontalLine";
import {
  AnyTimeActionTaxClearanceCertificateReviewElement
} from "@/components/tasks/anytime-action/AnyTimeActionTaxClearanceCertificateReviewElement";
import {ActionBarLayout} from "@/components/njwds-layout/ActionBarLayout";
import {SecondaryButton} from "@/components/njwds-extended/SecondaryButton";
import {PrimaryButton} from "@/components/njwds-extended/PrimaryButton";
import {CtaContainer} from "@/components/njwds-extended/cta/CtaContainer";
import {UnStyledButton} from "@/components/njwds-extended/UnStyledButton";
import {ButtonIcon} from "@/components/ButtonIcon";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
  CMS_ONLY_stepIndex?: number;
}


export const AnytimeActionTaxClearanceCertificateElement = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const TaxClearanceCertificateSteps = [{ name: "Requirements", hasError: false, isComplete: false }, { name: "Check Eligibility", hasError: false, isComplete: false }, { name: "Review", hasError: false, isComplete: false}];
  const [stateTaxClearanceCertificateSteps, setStateTaxClearanceCertificateSteps] = useState(TaxClearanceCertificateSteps);

  return (
    <>
    <div className="min-height-38rem">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-y-4 margin-x-4 margin-bottom-2">
          <h1>{props.anytimeAction.name}</h1>
        </div>
      </div>
      <HorizontalStepper
        steps={stateTaxClearanceCertificateSteps}
        currentStep={stepIndex}
        onStepClicked={(step: number): void => {
          setStateTaxClearanceCertificateSteps((prevState) => {
            const newState = [...prevState];
            newState[0].isComplete = step !== 0;
            return newState;
          })
          setStepIndex(step);
        }}
      />
      {stepIndex === 0 && (
        <div data-testid={"requirements-tab"}>
          <Content>{Config.taxClearanceCertificateStep1.content}</Content>
          <HorizontalLine />
          <span>{Config.taskDefaults.issuingAgencyText}:{' '}</span><span>{Config.taxClearanceCertificateStep1.issuingAgencyText}</span>
        </div>)}
      {stepIndex === 1 && (<div data-testid={"eligibility-tab"}>Tab 2-{stepIndex}</div>)}
      {stepIndex === 2 && (<div data-testid={"review-tab"}><AnyTimeActionTaxClearanceCertificateReviewElement /></div>)}
    </div>
  <CtaContainer>
    <ActionBarLayout>
      <div
        className="flex fac margin-top-3 mobile-lg:margin-top-0 mobile-lg:margin-left-auto mobile-lg:margin-right-3 width-full mobile-lg:width-auto">
        <UnStyledButton
          isBgTransparent
          className={"text-accent-cool-darker fjc padding-0"}
          isTextBold
          isIntercomEnabled
          dataTestid={"help-button"}
          onClick={(): void => {}}
        >
          <ButtonIcon svgFilename="help-circle-blue" sizePx="25px"/>
          {Config.formation.general.helpButtonText}
        </UnStyledButton>
      </div>
      {stepIndex === 0 && (
        <>
          <PrimaryButton
            isColor="primary"
            onClick={(): void => {
            }}
            dataTestId="cta-primary"
          >
            Continue
          </PrimaryButton>
        </>)}
      {stepIndex !== 0 && (
        <>
          <SecondaryButton
            isColor="primary"
            onClick={(): void => {}
            }
            dataTestId="cta-secondary"
          >
            Back
          </SecondaryButton>
          <PrimaryButton
            isColor="primary"
            onClick={(): void => {
            }}
            dataTestId="cta-primary"
          >
            Save & Continue
          </PrimaryButton>
        </>)}
    </ActionBarLayout>
  </CtaContainer>
    </>
  );
};
