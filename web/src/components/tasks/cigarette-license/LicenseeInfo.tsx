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
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { ProfileField } from "@/components/profile/ProfileField";
import { getInitialTaxId } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { MailingAddress } from "@/components/tasks/cigarette-license/fields/MailingAddress";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { ReactElement, useContext } from "react";

interface Props {
  setStepIndex: (idx: number) => void;
}

export const LicenseeInfo = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  const hasSubmittedTaxData =
    business?.taxFilingData.state === "SUCCESS" || business?.taxFilingData.state === "PENDING";

  const shouldShowTradeNameElements = (): boolean => {
    if (!business) return false;
    return LookupLegalStructureById(business.profileData.legalStructureId).hasTradeName;
  };

  const dataFormErrorMap = useContext(DataFormErrorMapContext);

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
      <p className="margin-bottom-3">
        {Config.cigaretteLicenseStep2.licenseeInformationDescription}
      </p>

      <div className="margin-y-2">
        <ProfileField
          // locked={shouldLockFormationFields}
          fieldName={"businessName"}
          hideLine
          fullWidth
          isVisible={!shouldShowTradeNameElements()}
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
          isVisible={shouldShowTradeNameElements()}
          locked={hasSubmittedTaxData}
          hideLine
          fullWidth
        >
          {/* do we need to override text? */}
          <ResponsibleOwnerName inputWidth="full" />
        </ProfileField>
        <ProfileField
          fieldName="tradeName"
          isVisible={shouldShowTradeNameElements()}
          hideLine
          fullWidth
        >
          <TradeName inputWidth="full" />
        </ProfileField>
      </div>
      <div className="margin-y-2">
        <ProfileField fieldName="taxId" noLabel fullWidth>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />

          <div className="max-width-38rem">
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

      {/* Business Address */}
      <h2 className="padding-top-2">{Config.cigaretteLicenseStep2.businessAddressHeader}</h2>
      <p>{Config.cigaretteLicenseStep2.businessAddressDescription}</p>
      <UnitedStatesAddress
        onValidation={onValidation}
        dataFormErrorMap={dataFormErrorMap}
        isFullWidth
      />
      <HorizontalLine />

      {/* Mailing Address */}
      <h2 className="padding-top-2">{Config.cigaretteLicenseStep2.mailingAddressHeader}</h2>
      <p>{Config.cigaretteLicenseStep2.mailingAddressDescription}</p>

      <MailingAddress />

      {/* footer */}
      <HorizontalLine />
      <span className="h5-styling">{Config.cigaretteLicenseShared.issuingAgencyLabelText}: </span>
      <span className="h6-styling">{Config.cigaretteLicenseShared.issuingAgencyText}</span>

      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <PrimaryButton
            isColor="primary"
            onClick={() => props.setStepIndex(1)}
            dataTestId="cta-primary-1"
            isRightMarginRemoved={true}
          >
            {Config.cigaretteLicenseStep1.continueButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
