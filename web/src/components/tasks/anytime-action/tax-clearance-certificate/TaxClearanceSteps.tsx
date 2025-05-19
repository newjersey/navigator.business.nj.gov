import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { AnytimeActionTaxClearanceCertificateAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateAlert";
import { getAllFieldsNonEmpty } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { CheckEligibility } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/CheckEligibility";
import { Download } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Download";
import { Requirements } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Requirements";
import { Review } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Review";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import { StepperStep } from "@/lib/types/types";
import { TaxClearanceCertificateData } from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import { FormEvent, ReactElement, useContext, useState } from "react";

interface Props {
  taxClearanceCertificateData: TaxClearanceCertificateData;
  certificatePdfBlob?: Blob;
  saveTaxClearanceCertificateData: () => void;
  isValid: () => boolean;
  getInvalidFieldIds: () => string[];
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  CMS_ONLY_stepIndex?: number;
}

export const TaxClearanceSteps = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const [certificatePdfBlob, setCertificatePdfBlob] = useState<Blob | undefined>(
    props.certificatePdfBlob || undefined,
  );
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);

  const onStepClick = (step: number): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
    } else {
      if (step === 2 && stepIndex === 1) {
        props.saveTaxClearanceCertificateData();
      }
      setStepIndex(step);
    }

  };

  const onSave = (): void => {
    props.saveTaxClearanceCertificateData();
    setStepIndex(2);
  };

  const stepperSteps: StepperStep[] = [
    {
      name: Config.taxClearanceCertificateShared.stepperOneLabel,
      hasError: false,
      isComplete: stepIndex > 0 || getAllFieldsNonEmpty(props.taxClearanceCertificateData),
    },
    {
      name: Config.taxClearanceCertificateShared.stepperTwoLabel,
      hasError: false,
      isComplete: props.isValid() && getAllFieldsNonEmpty(props.taxClearanceCertificateData),
    },
    {
      name: Config.taxClearanceCertificateShared.stepperThreeLabel,
      hasError: false,
      isComplete: false,
    },
  ];

  const stepsComponents: { component: ReactElement }[] = [
    { component: <Requirements setStepIndex={setStepIndex} /> },
    {
      component: (
        <CheckEligibility setStepIndex={setStepIndex} onSave={onSave} onSubmit={props.onSubmit} />
      ),
    },
    {
      component: (
        <Review setStepIndex={setStepIndex} setCertificatePdfBlob={setCertificatePdfBlob} />
      ),
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
            steps={stepperSteps}
            currentStep={stepIndex}
            onStepClicked={onStepClick}
          />
          <AnytimeActionTaxClearanceCertificateAlert fieldErrors={props.getInvalidFieldIds()} />
          {stepsComponents[stepIndex].component}
        </>
      )}
    </>
  );
};
