import { UnitedStatesAddress } from "@/components/data-fields/address/UnitedStatesAddress";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { DisabledTaxId } from "@/components/data-fields/tax-id/DisabledTaxId";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { ProfileAddressLockedFields } from "@/components/profile/ProfileAddressLockedFields";
import { ProfileField } from "@/components/profile/ProfileField";
import {
  getInitialTaxId,
  getInitialTaxPin,
} from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { StateAgencyDropdown } from "@/components/tasks/anytime-action/tax-clearance-certificate/StateAgencyDropdown";
import { TaxDisclaimer } from "@/components/TaxDisclaimer";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { shouldLockBusinessAddress } from "@/lib/utils/taskHelpers";
import { hasCompletedFormation } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext, useState } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  saveTaxClearanceCertificateData: () => Promise<void>;
}

export const CheckEligibility = (props: Props): ReactElement => {
  const dataFormErrorMap = useContext(DataFormErrorMapContext);
  const [shouldLockFormationFields, setShouldLockFormationFields] = useState<boolean>(false);

  const { Config } = useConfig();

  const { doesRequiredFieldHaveError, doesFieldHaveError } = useAddressErrors();
  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidAddressLine2 } = useFormContextFieldHelpers(
    "addressLine2",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidCity } = useFormContextFieldHelpers(
    "addressCity",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidState } = useFormContextFieldHelpers(
    "addressState",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers(
    "addressZipCode",
    DataFormErrorMapContext,
  );

  const onValidation = (): void => {
    setIsValidAddressLine1(!doesRequiredFieldHaveError("addressLine1"));
    setIsValidAddressLine2(!doesFieldHaveError("addressLine2"));
    setIsValidCity(!doesRequiredFieldHaveError("addressCity"));
    setIsValidState(!doesRequiredFieldHaveError("addressState"));
    setIsValidZipCode(!doesRequiredFieldHaveError("addressZipCode"));
  };
  const { business } = useUserData();

  const handleSaveButtonClick = (): void => {
    analytics.event.tax_clearance.click.switch_to_step_three();
    // React 19: Use setTimeout with delay to ensure all batched state updates flush
    // This ensures all blur-based updates complete before saving (increased from 100ms to 300ms for React 19)
    // With blur-based updates, this delay ensures blur events have propagated before save
    setTimeout(async () => {
      try {
        await props.saveTaxClearanceCertificateData();
      } catch (error) {
        console.error("Error saving tax clearance data:", error);
        // Continue to Review screen even if save fails - validation will happen there
      }
      props.setStepIndex(2);
    }, 300);
  };

  const handleBackButtonClick = (): void => {
    analytics.event.tax_clearance.click.switch_to_step_one();
    props.setStepIndex(0);
  };

  const hasSubmittedTaxData =
    business?.taxFilingData.state === "SUCCESS" || business?.taxFilingData.state === "PENDING";

  useMountEffectWhenDefined(() => {
    if (business) {
      setShouldLockFormationFields(hasCompletedFormation(business));
    }
  }, business);

  return (
    <>
      <div>
        <Heading level={2}>
          {Config.taxClearanceCertificateStep2.requestingAgencySectionHeader}
        </Heading>
        <div id={`question-requestingAgencyId`} data-testid={"requestingAgency"}>
          <StateAgencyDropdown preventRefreshWhenUnmounted />
        </div>
        <HorizontalLine />
        <div className="margin-top-3">
          <Heading level={2}>
            {Config.taxClearanceCertificateStep2.businessInformationSectionHeader}
          </Heading>
        </div>
        <div className="margin-y-2">
          <ProfileField
            locked={shouldLockFormationFields}
            fieldName={"businessName"}
            hideLine
            fullWidth
          >
            <BusinessName
              inputWidth="full"
              required={true}
              validationText={Config.taxClearanceCertificateShared.businessNameErrorText}
              preventRefreshWhenUnmounted
            />
          </ProfileField>
        </div>
        <div className="margin-y-2">
          {shouldLockBusinessAddress(business) ? (
            <ProfileAddressLockedFields businessLocation="US" />
          ) : (
            <UnitedStatesAddress
              onValidation={onValidation}
              dataFormErrorMap={dataFormErrorMap}
              isFullWidth
            />
          )}
        </div>

        <div className="margin-y-2">
          <ProfileField fieldName="taxId" noLabel>
            <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
            {!hasSubmittedTaxData && (
              <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
            )}
            <div className="max-width-38rem">
              {hasSubmittedTaxData ? (
                <DisabledTaxId />
              ) : (
                <TaxId
                  key="taxClearanceTaxId"
                  dbBusinessTaxId={getInitialTaxId(business)}
                  inputWidth="full"
                  preventRefreshWhenUnmounted
                  required
                />
              )}
            </div>
          </ProfileField>
        </div>
        <div>
          <ProfileField fieldName="taxPin" hideLine fullWidth>
            <TaxPin
              dbBusinessTaxPin={getInitialTaxPin(business)}
              inputWidth="full"
              preventRefreshWhenUnmounted
              required
            />
          </ProfileField>
        </div>
      </div>
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton
            analyticsEvent={
              analytics.event.tax_clearance_anytime_action_help_button.click.open_live_chat
            }
          />
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton isColor="primary" onClick={handleBackButtonClick}>
              {Config.taxClearanceCertificateShared.backButtonText}
            </SecondaryButton>
          </div>
          <PrimaryButton
            isColor="primary"
            onClick={handleSaveButtonClick}
            isRightMarginRemoved={true}
          >
            {Config.taxClearanceCertificateShared.saveButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
