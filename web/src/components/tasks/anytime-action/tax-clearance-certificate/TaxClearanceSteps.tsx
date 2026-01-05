import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { AnytimeActionTaxClearanceCertificateAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateAlert";
import { isAnyRequiredFieldEmpty } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { CheckEligibility } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/CheckEligibility";
import { Download } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Download";
import { Requirements } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Requirements";
import { Review } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Review";
import { AddressContext } from "@/contexts/addressContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
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
  saveTaxClearanceCertificateData: () => Promise<void>;
  isValid: () => boolean;
  getInvalidFieldIds: () => string[];
  setCertificatePdfBlob: (certificatePdfBlob: Blob) => void;
  CMS_ONLY_stepIndex?: number;
}

export const TaxClearanceSteps = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state: taxClearanceCertificateData } = useContext(TaxClearanceCertificateDataContext);
  const { state: profileState } = useContext(ProfileDataContext);
  const profileData = profileState.profileData;
  const addressContext = useContext(AddressContext);
  const addressData = addressContext.state.formationAddressData;
  const { updateQueue } = useUserData();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const [downloadTimestamp] = useState(() => Date.now());

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

  // React 19: With blur-based updates, we need to check both saved and unsaved data
  // Merge taxClearanceCertificateData with unsaved profileData and addressData
  const currentData = {
    ...taxClearanceCertificateData,
    businessName: profileData.businessName || taxClearanceCertificateData.businessName,
    taxId: profileData.taxId || taxClearanceCertificateData.taxId,
    taxPin: profileData.taxPin || taxClearanceCertificateData.taxPin,
    addressLine1: addressData.addressLine1 || taxClearanceCertificateData.addressLine1,
    addressLine2: addressData.addressLine2 || taxClearanceCertificateData.addressLine2,
    addressCity: addressData.addressCity || taxClearanceCertificateData.addressCity,
    addressState: addressData.addressState || taxClearanceCertificateData.addressState,
    addressZipCode: addressData.addressZipCode || taxClearanceCertificateData.addressZipCode,
  };

  const stepperSteps: StepperStep[] = [
    {
      name: Config.taxClearanceCertificateShared.stepperOneLabel,
      hasError: false,
      isComplete: stepIndex > 0 || !isAnyRequiredFieldEmpty(currentData),
    },
    {
      name: Config.taxClearanceCertificateShared.stepperTwoLabel,
      hasError: props.getInvalidFieldIds().length > 0,
      isComplete: props.isValid() && !isAnyRequiredFieldEmpty(currentData),
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

  // Clear error when form fields change (watches both saved and unsaved data)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setResponseErrorType(undefined);
    }, 0);
    return (): void => clearTimeout(timeoutId);
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
    // Also watch profileData and addressData for unsaved changes (blur-based updates)
    profileData.businessName,
    profileData.taxId,
    profileData.taxPin,
    addressData.addressLine1,
    addressData.addressLine2,
    addressData.addressCity,
    addressData.addressState,
    addressData.addressZipCode,
  ]);

  return (
    <>
      {props.certificatePdfBlob ? (
        <Download
          certificatePdfBlob={props.certificatePdfBlob}
          downloadFilename={`Tax Clearance Certificate - ${downloadTimestamp}`}
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
