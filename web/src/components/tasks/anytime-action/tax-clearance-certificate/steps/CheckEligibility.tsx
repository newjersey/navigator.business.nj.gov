import { UnitesStatesAddress } from "@/components/data-fields/address/UnitesStatesAddress";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { ProfileField } from "@/components/profile/ProfileField";
import {
  getInitialTaxId,
  getInitialTaxPin,
} from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { StateAgencyDropdown } from "@/components/tasks/anytime-action/tax-clearance-certificate/StateAgencyDropdown";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { FormEvent, ReactElement } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  onSave: (event?: FormEvent<HTMLFormElement>) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
}

export const CheckEligibility = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const { doesFieldHaveError } = useAddressErrors();
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
    setIsValidAddressLine1(!doesFieldHaveError("addressLine1"));
    setIsValidAddressLine2(!doesFieldHaveError("addressLine2"));
    setIsValidCity(!doesFieldHaveError("addressCity"));
    setIsValidState(!doesFieldHaveError("addressState"));
    setIsValidZipCode(!doesFieldHaveError("addressZipCode"));
  };
  const { business } = useUserData();

  const handleSaveButtonClick = (): void => {
    analytics.event.tax_clearance.click.switch_to_step_three();
    props.onSave();
    props.onSubmit();
  };

  const handleBackButtonClick = (): void => {
    analytics.event.tax_clearance.click.switch_to_step_one();
    props.setStepIndex(0);
  };

  return (
    <>
      <div>
        <Heading level={2} styleVariant={"h3"}>
          {Config.taxClearanceCertificateStep2.requestingAgencySectionHeader}
        </Heading>
        <div id={`question-requestingAgencyId`} data-testid={"requestingAgency"}>
          <StateAgencyDropdown preventRefreshWhenUnmounted />
        </div>
        <HorizontalLine />
        <div className="margin-top-3">
          <Heading level={2} styleVariant={"h3"}>
            {Config.taxClearanceCertificateStep2.businessInformationSectionHeader}
          </Heading>
        </div>
        <div className="margin-y-2">
          <ProfileField fieldName={"businessName"} hideLine fullWidth>
            <BusinessName
              inputWidth="full"
              required={true}
              validationText={Config.taxClearanceCertificateShared.businessNameErrorText}
              preventRefreshWhenUnmounted
            />
          </ProfileField>
        </div>
        <div className="margin-y-2">
          <UnitesStatesAddress onValidation={onValidation} isFullWidth />
        </div>
        <div className="margin-y-2">
          <ProfileField fieldName="taxId" hideLine fullWidth>
            <TaxId
              dbBusinessTaxId={getInitialTaxId(business)}
              inputWidth="full"
              preventRefreshWhenUnmounted
              required
            />
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
          <LiveChatHelpButton />
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
