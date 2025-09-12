import { Content } from "@/components/Content";
import { UnitedStatesAddress } from "@/components/data-fields/address/UnitedStatesAddress";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { ResponsibleOwnerName } from "@/components/data-fields/ResponsibleOwnerName";
import { DisabledTaxId } from "@/components/data-fields/tax-id/DisabledTaxId";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TradeName } from "@/components/data-fields/TradeName";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { ProfileAddressLockedFields } from "@/components/profile/ProfileAddressLockedFields";
import { ProfileField } from "@/components/profile/ProfileField";
import { getInitialTaxId } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { ContactInformation } from "@/components/tasks/cigarette-license/fields/ContactInformation";
import { MailingAddress } from "@/components/tasks/cigarette-license/fields/MailingAddress";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isTradeNameLegalStructureApplicable } from "@/lib/domain-logic/isTradeNameLegalStructureApplicable";
import analytics from "@/lib/utils/analytics";
import { shouldLockBusinessAddress } from "@/lib/utils/taskHelpers";
import { hasCompletedFormation } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

interface Props {
  setStepIndex: (idx: number) => void;
  CMS_ONLY_show_error?: boolean;
}

export const LicenseeInfo = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  const hasSubmittedTaxData =
    business?.taxFilingData.state === "SUCCESS" || business?.taxFilingData.state === "PENDING";
  const hasFormedBusiness = hasCompletedFormation(business);

  const dataFormErrorMap = useContext(DataFormErrorMapContext);
  const { saveCigaretteLicenseData } = useContext(CigaretteLicenseContext);

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

  return (
    <>
      <h2 className="margin-bottom-2">{Config.cigaretteLicenseStep2.licenseeInformationHeader}</h2>
      <Content className="margin-bottom-3">
        {Config.cigaretteLicenseStep2.licenseeInformationDescription}
      </Content>

      <div className="margin-y-2">
        <ProfileField
          locked={hasSubmittedTaxData || hasFormedBusiness}
          fieldName={"businessName"}
          hideLine
          fullWidth
          isVisible={!isTradeNameLegalStructureApplicable(business?.profileData.legalStructureId)}
        >
          <BusinessName
            inputWidth="full"
            required={true}
            validationText={Config.cigaretteLicenseStep2.businessNameErrorText}
            preventRefreshWhenUnmounted
          />
        </ProfileField>
        <ProfileField
          fieldName="responsibleOwnerName"
          isVisible={isTradeNameLegalStructureApplicable(business?.profileData.legalStructureId)}
          locked={hasSubmittedTaxData || hasFormedBusiness}
          hideLine
          fullWidth
        >
          <ResponsibleOwnerName inputWidth="full" required />
        </ProfileField>
        <ProfileField
          locked={hasSubmittedTaxData || hasFormedBusiness}
          fieldName="tradeName"
          isVisible={isTradeNameLegalStructureApplicable(business?.profileData.legalStructureId)}
          hideLine
          fullWidth
        >
          <TradeName inputWidth="full" required />
        </ProfileField>
      </div>
      <div className="margin-y-2">
        <ProfileField fieldName="taxId" noLabel fullWidth>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />

          <div className="max-width-30rem">
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <TaxId
                dbBusinessTaxId={getInitialTaxId(business)}
                inputWidth="full"
                preventRefreshWhenUnmounted
                required
              />
            )}
          </div>
        </ProfileField>
      </div>

      <h2 className="padding-top-2">{Config.cigaretteLicenseStep2.businessAddressHeader}</h2>
      <p>{Config.cigaretteLicenseStep2.businessAddressDescription}</p>
      <div data-testid="business-address-section" className="margin-y-4">
        {shouldLockBusinessAddress(business) ? (
          <ProfileAddressLockedFields businessLocation="US" />
        ) : (
          <UnitedStatesAddress
            onValidation={onValidation}
            isFullWidth
            dataFormErrorMap={dataFormErrorMap}
            stateInputLocked
          />
        )}
      </div>
      <HorizontalLine />

      <h2 className="padding-top-2">{Config.cigaretteLicenseStep2.mailingAddressHeader}</h2>
      <Content>{Config.cigaretteLicenseStep2.mailingAddressDescription}</Content>

      <div data-testid="mailing-address-section" className="margin-y-2">
        <MailingAddress CMS_ONLY_show_error={props.CMS_ONLY_show_error} />
      </div>

      <HorizontalLine />

      <h2 className="padding-top-2">{Config.cigaretteLicenseStep2.contactInformationHeader}</h2>
      <Content>{Config.cigaretteLicenseStep2.contactInformationDescription}</Content>

      <div className="margin-y-2">
        <ContactInformation CMS_ONLY_show_error={props.CMS_ONLY_show_error} />
      </div>

      <HorizontalLine />
      <span className="h5-styling">{Config.cigaretteLicenseShared.issuingAgencyLabelText}: </span>
      <span className="h6-styling">{Config.cigaretteLicenseShared.issuingAgencyText}</span>

      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <SecondaryButton
            isColor="primary"
            onClick={() => {
              analytics.event.cigarette_license.click.switch_to_step_one();
              props.setStepIndex(0);
            }}
            dataTestId="back"
          >
            {Config.cigaretteLicenseStep2.backButtonText}
          </SecondaryButton>
          <PrimaryButton
            isColor="primary"
            onClick={() => {
              analytics.event.cigarette_license.click.step_two_continue_button();
              props.setStepIndex(2);
              saveCigaretteLicenseData();
            }}
            dataTestId="cta-primary-1"
            isRightMarginRemoved={true}
          >
            {Config.cigaretteLicenseStep2.nextButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
