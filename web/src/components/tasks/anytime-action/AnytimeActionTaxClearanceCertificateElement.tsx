import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import {ReactElement, useState} from "react";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {HorizontalStepper} from "@/components/njwds-extended/HorizontalStepper";
import { Content } from "@/components/Content";
import {HorizontalLine} from "@/components/HorizontalLine";
import {
  AnyTimeActionTaxClearanceCertificateReviewElement
} from "@/components/tasks/anytime-action/AnyTimeActionTaxClearanceCertificateReviewElement";

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
        <div>
          <Content>{Config.taxClearanceCertificateStep1.content}</Content>
          <HorizontalLine />
          <span>{Config.taskDefaults.issuingAgencyText}:{' '}</span><span>{Config.taxClearanceCertificateStep1.issuingAgencyText}</span>
        </div>)}
      {stepIndex === 1 && (<div>Tab 2-{stepIndex}</div>)}
      {stepIndex === 2 && (<div><AnyTimeActionTaxClearanceCertificateReviewElement /></div>)}
    </div>
  );
};
