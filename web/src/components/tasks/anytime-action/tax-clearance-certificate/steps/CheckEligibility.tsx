import { Content } from "@/components/Content";
import { UnitesStatesAddress } from "@/components/data-fields/address/UnitesStatesAddress";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { BusinessStructure } from "@/components/data-fields/BusinessStructure";
import { DateOfFormation } from "@/components/data-fields/DateOfFormation";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { HorizontalLine } from "@/components/HorizontalLine";
import { LegalStructureDropDown } from "@/components/LegalStructureDropDown";
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
import { HowToCheckEligibilityQuestion } from "@/components/tasks/anytime-action/tax-clearance-certificate/HowToCheckEligibilityQuestion";
import { StateAgencyDropdown } from "@/components/tasks/anytime-action/tax-clearance-certificate/StateAgencyDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import {
  LookupLegalStructureById,
  TaxClearanceEligibilityOption,
} from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  saveTaxClearanceCertificateData: () => void;
}

export const CheckEligibility = (props: Props): ReactElement => {
  const dataFormErrorMap = useContext(DataFormErrorMapContext);
  const { state: taxClearanceCertificateData, setTaxClearanceCertificateData } = useContext(
    TaxClearanceCertificateDataContext,
  );

  const isTaxClearanceStructureValidationEnabled =
    process.env.FEATURE_TAX_CLEARANCE_STRUCTURE_VALIDATION === "true";

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
  const { setIsValid: setIsValidTaxId } = useFormContextFieldHelpers(
    "taxId",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidTaxPin } = useFormContextFieldHelpers(
    "taxPin",
    DataFormErrorMapContext,
  );
  const { isFormFieldInvalid: isInvalidLegalStructure, setIsValid: setIsValidLegalStructure } =
    useFormContextFieldHelpers("legalStructureId", DataFormErrorMapContext);
  const { setIsValid: setIsValidDateOfFormation } = useFormContextFieldHelpers(
    "dateOfFormation",
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
    props.saveTaxClearanceCertificateData();
    props.setStepIndex(2);
  };

  const handleBackButtonClick = (): void => {
    analytics.event.tax_clearance.click.switch_to_step_one();
    props.setStepIndex(0);
  };

  const setEligibilityOption = (option: TaxClearanceEligibilityOption): void => {
    if (option === "TAX_ID") {
      setIsValidLegalStructure(true);
      setIsValidDateOfFormation(true);
    }
    if (option === "BUSINESS_TYPE") {
      setIsValidTaxId(true);
      setIsValidTaxPin(true);
    }

    setTaxClearanceCertificateData({
      ...taxClearanceCertificateData,
      checkEligibilityOption: option,
    });
  };

  const getStructureField = (): ReactElement => {
    if (business?.profileData?.businessPersona === "OWNING") {
      return (
        <WithErrorBar hasError={isInvalidLegalStructure} type="ALWAYS">
          <div className="margin-bottom-05">
            <FieldLabelDescriptionOnly fieldName="legalStructureId" bold={true} />
            <Content>{Config.taxAccess.legalStructureDropDownHeader}</Content>
          </div>
          <LegalStructureDropDown fullWidth preventRefreshWhenUnmounted />
        </WithErrorBar>
      );
    }

    return (
      <ProfileField
        fieldName="legalStructureId"
        noLabel
        locked
        hideLine
        fullWidth
        lockedValueFormatter={(legalStructureId): string =>
          LookupLegalStructureById(legalStructureId).name
        }
      >
        <BusinessStructure />
      </ProfileField>
    );
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
        {isTaxClearanceStructureValidationEnabled && (
          <HowToCheckEligibilityQuestion
            eligibilityOption={taxClearanceCertificateData.checkEligibilityOption}
            setEligibilityOption={setEligibilityOption}
          />
        )}
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
          <UnitesStatesAddress
            onValidation={onValidation}
            dataFormErrorMap={dataFormErrorMap}
            isFullWidth
          />
        </div>
        {taxClearanceCertificateData.checkEligibilityOption === "TAX_ID" && (
          <>
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
          </>
        )}
        {taxClearanceCertificateData.checkEligibilityOption === "BUSINESS_TYPE" && (
          <>
            <div className="margin-y-2">{getStructureField()}</div>
            <div className="margin-y-2">
              <ProfileField fieldName="dateOfFormation" hideLine fullWidth>
                <DateOfFormation required futureAllowed={false} preventRefreshWhenUnmounted />
              </ProfileField>
            </div>
          </>
        )}
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
