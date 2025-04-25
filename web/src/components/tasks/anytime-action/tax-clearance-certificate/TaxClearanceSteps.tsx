import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { CheckEligibility } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/CheckEligibility";
import { Download } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Download";
import { Requirements } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Requirements";
import { Review } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Review";
import { StepperStep } from "@/lib/types/types";
import { ReactElement, useState } from "react";

interface Props {
  steps: StepperStep[];
  certificatePdfBlob?: Blob;
  currentStep: number;
  stepIndex: (value: ((prevState: number) => number) | number) => void;
  saveTaxClearanceCertificateData: () => void;
  setStepIndex: (step: number) => void;
}

export const TaxClearanceSteps = (props: Props): ReactElement => {
  const [certificatePdfBlob, setCertificatePdfBlob] = useState<Blob | undefined>(
    props.certificatePdfBlob || undefined
  );

  const onStepClick = (step: number): void => {
    if (step === 2 && props.currentStep === 1) {
      props.saveTaxClearanceCertificateData();
    }
    props.setStepIndex(step);
  };

  const steps: { component: ReactElement }[] = [
    { component: <Requirements setStepIndex={props.stepIndex} /> },
    {
      component: (
        <CheckEligibility
          setStepIndex={props.stepIndex}
          saveTaxClearanceCertificateData={props.saveTaxClearanceCertificateData}
        />
      ),
    },
    {
      component: <Review setStepIndex={props.stepIndex} setCertificatePdfBlob={setCertificatePdfBlob} />,
    },
  ];

  return (
    <>
      {certificatePdfBlob ? (
        <Download
          certificatePdfBlob={certificatePdfBlob}
          downloadFilename={`Tax Clearance Certificate - ${Date.now()}`}
        />
      ) : (
        <>
          <HorizontalStepper
            steps={props.steps}
            currentStep={props.currentStep}
            onStepClicked={onStepClick}
          />
          {steps[props.currentStep].component}
        </>
      )}
    </>
  );
};
