import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaxClearanceStepOne } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepOne";
import { TaxClearanceStepThree } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepThree";
import { TaxClearanceStepTwo } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepTwo";
import { StepperStep } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  steps: StepperStep[];
  currentStep: number;
  stepIndex: (value: ((prevState: number) => number) | number) => void;
  saveTaxClearanceCertificateData: () => void;
  setStepIndex: (step: number) => void;
  setCertificatePdfBlob: (
    value: ((prevState: Blob | undefined) => Blob | undefined) | Blob | undefined
  ) => void;
}

export const TaxClearanceSteps = (props: Props): ReactElement => {
  const onStepClick = (step: number): void => {
    if (step === 2 && props.currentStep === 1) {
      props.saveTaxClearanceCertificateData();
    }
    props.setStepIndex(step);
  };

  return (
    <>
      <HorizontalStepper steps={props.steps} currentStep={props.currentStep} onStepClicked={onStepClick} />
      {props.currentStep === 0 && <TaxClearanceStepOne setStepIndex={props.stepIndex} />}
      {props.currentStep === 1 && (
        <TaxClearanceStepTwo
          setStepIndex={props.stepIndex}
          saveTaxClearanceCertificateData={props.saveTaxClearanceCertificateData}
        />
      )}
      {props.currentStep === 2 && (
        <TaxClearanceStepThree
          setStepIndex={props.stepIndex}
          setCertificatePdfBlob={props.setCertificatePdfBlob}
        />
      )}
    </>
  );
};
