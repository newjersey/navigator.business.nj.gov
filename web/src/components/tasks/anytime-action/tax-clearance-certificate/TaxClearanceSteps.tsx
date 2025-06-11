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
import { StepperStep } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { TaxClearanceCertificateData } from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import { ReactElement, useContext, useEffect, useState } from "react";

interface Props {
  taxClearanceCertificateData: TaxClearanceCertificateData;
  certificatePdfBlob?: Blob;
  saveTaxClearanceCertificateData: () => void;
  isValid: () => boolean;
  getInvalidFieldIds: () => string[];
  setCertificatePdfBlob: (certificatePdfBlob: Blob) => void;
  CMS_ONLY_stepIndex?: number;
}

export const TaxClearanceSteps = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);

  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const [responseErrorType, setResponseErrorType] = useState<
    TaxClearanceCertificateResponseErrorType | undefined
  >(undefined);

  const fireAnalyticsEvent = (step: number): void => {
    const events = [
      analytics.event.tax_clearance.click.switch_to_step_one,
      analytics.event.tax_clearance.click.switch_to_step_two,
      analytics.event.tax_clearance.click.switch_to_step_three,
    ];

    if (events[step]) events[step]();
  };

  const onStepClick = (step: number): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
    } else {
      fireAnalyticsEvent(step);
      if (step === 2) {
        props.saveTaxClearanceCertificateData();
      }
      setStepIndex(step);
    }
  };

  const stepperSteps: StepperStep[] = [
    {
      name: Config.taxClearanceCertificateShared.stepperOneLabel,
      hasError: false,
      isComplete: stepIndex > 0 || getAllFieldsNonEmpty(props.taxClearanceCertificateData),
    },
    {
      name: Config.taxClearanceCertificateShared.stepperTwoLabel,
      hasError: props.getInvalidFieldIds().length > 0,
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
        <CheckEligibility
          setStepIndex={setStepIndex}
          saveTaxClearanceCertificateData={props.saveTaxClearanceCertificateData}
        />
      ),
    },
    {
      component: (
        <Review
          setStepIndex={setStepIndex}
          setCertificatePdfBlob={props.setCertificatePdfBlob}
          isValid={props.isValid}
          setResponseErrorType={setResponseErrorType}
          saveTaxClearanceCertificateData={props.saveTaxClearanceCertificateData}
        />
      ),
    },
  ];

  useEffect(() => {
    setResponseErrorType(undefined);
  }, [
    props.taxClearanceCertificateData.requestingAgencyId,
    props.taxClearanceCertificateData.businessName,
    props.taxClearanceCertificateData.addressLine1,
    props.taxClearanceCertificateData.addressLine2,
    props.taxClearanceCertificateData.addressCity,
    props.taxClearanceCertificateData.addressState,
    props.taxClearanceCertificateData.addressZipCode,
    props.taxClearanceCertificateData.taxId,
    props.taxClearanceCertificateData.taxPin,
  ]);

  return (
    <>
      {props.certificatePdfBlob ? (
        <Download
          certificatePdfBlob={props.certificatePdfBlob}
          downloadFilename={`Tax Clearance Certificate - ${Date.now()}`}
        />
      ) : (
        <>
          <AnytimeActionTaxClearanceCertificateAlert
            setStepIndex={setStepIndex}
            fieldErrors={props.getInvalidFieldIds()}
            responseErrorType={responseErrorType}
          />
          <HorizontalStepper
            steps={stepperSteps}
            currentStep={stepIndex}
            onStepClicked={onStepClick}
            suppressRefocusBehavior={props.getInvalidFieldIds().length > 0}
          />
          {stepsComponents[stepIndex].component}
        </>
      )}
    </>
  );
};
