import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { AnytimeActionTaxClearanceCertificateAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateAlert";
import { isAnyRequiredFieldEmpty } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { CheckEligibility } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/CheckEligibility";
import { Download } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Download";
import { Requirements } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Requirements";
import { Review } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Review";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { StepperStep } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useContext, useEffect, useState } from "react";

interface Props {
  certificatePdfBlob?: Blob;
  saveTaxClearanceCertificateData: () => void;
  isValid: () => boolean;
  getInvalidFieldIds: () => string[];
  setCertificatePdfBlob: (certificatePdfBlob: Blob) => void;
  CMS_ONLY_stepIndex?: number;
}

export const TaxClearanceSteps = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state: taxClearanceCertificateData } = useContext(TaxClearanceCertificateDataContext);
  const { updateQueue } = useUserData();
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
      updateQueue?.queuePreferences({ returnToLink: ROUTES.taxClearanceCertificate }).update();
      setShowNeedsAccountModal(true);
    } else {
      if (step === 2) {
        props.saveTaxClearanceCertificateData();
      }
      fireAnalyticsEvent(step);
      setStepIndex(step);
    }
  };

  const stepperSteps: StepperStep[] = [
    {
      name: Config.taxClearanceCertificateShared.stepperOneLabel,
      hasError: false,
      isComplete: stepIndex > 0 || !isAnyRequiredFieldEmpty(taxClearanceCertificateData),
    },
    {
      name: Config.taxClearanceCertificateShared.stepperTwoLabel,
      hasError: props.getInvalidFieldIds().length > 0,
      isComplete: props.isValid() && !isAnyRequiredFieldEmpty(taxClearanceCertificateData),
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
    taxClearanceCertificateData.requestingAgencyId,
    taxClearanceCertificateData.businessName,
    taxClearanceCertificateData.addressLine1,
    taxClearanceCertificateData.addressLine2,
    taxClearanceCertificateData.addressCity,
    taxClearanceCertificateData.addressState,
    taxClearanceCertificateData.addressZipCode,
    taxClearanceCertificateData.taxId,
    taxClearanceCertificateData.taxPin,
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
            setResponseErrorType={setResponseErrorType}
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
