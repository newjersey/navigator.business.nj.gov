import { Content } from "@/components/Content";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { FormationStartDate } from "@/components/tasks/business-formation/business/FormationStartDate";
import { SuffixDropdown } from "@/components/tasks/business-formation/business/SuffixDropdown";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MediaQueries } from "@/lib/PageSizes";
import { zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const MainBusiness = (): ReactElement => {
  const { state, fieldsAreInvalid } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  return (
    <>
      <BusinessNameAndLegalStructure />
      <div
        className={`${isTabletAndUp ? "input-error-bar" : ""} ${
          fieldsAreInvalid(["businessSuffix", "businessStartDate"]) ? `error` : ""
        } grid-row tablet:grid-gap-1`}
      >
        <div
          className={`${!isTabletAndUp ? "input-error-bar" : ""} ${
            fieldsAreInvalid(["businessSuffix"]) ? `error` : ""
          } tablet:grid-col-6`}
        >
          <SuffixDropdown />
        </div>
        <div
          className={`${!isTabletAndUp ? "input-error-bar" : ""} ${
            fieldsAreInvalid(["businessStartDate"]) ? `error` : ""
          } tablet:grid-col-6`}
        >
          <FormationStartDate />
        </div>
      </div>
      {corpLegalStructures.includes(state.legalStructureId) ? (
        <div className="grid-row">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.businessTotalStockLabel}
            placeholder={Config.businessFormationDefaults.businessTotalStockPlaceholder}
            numericProps={{
              minLength: 1,
              trimLeadingZeroes: true,
              maxLength: 11,
            }}
            required={true}
            fieldName={"businessTotalStock"}
            validationText={Config.businessFormationDefaults.businessTotalStockErrorText}
            className="grid-col-6"
          />
          <div className="grid-col-6"></div>
        </div>
      ) : (
        <></>
      )}
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <div className="margin-bottom-2">
        <Content>{Config.businessFormationDefaults.businessAddressHeader}</Content>
      </div>
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.businessAddressAddressLine1Label}
        placeholder={Config.businessFormationDefaults.businessAddressAddressLine1Placeholder}
        fieldName="businessAddressLine1"
        required={true}
        className={"margin-bottom-2"}
        noValidationMargin={true}
        validationText={Config.businessFormationDefaults.businessAddressLine1ErrorText}
        formInputFull
      />
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.businessAddressAddressLine2Label}
        placeholder={Config.businessFormationDefaults.businessAddressAddressLine2Placeholder}
        fieldName="businessAddressLine2"
        formInputFull
        className={"margin-bottom-2"}
      />

      <div
        className={`${
          isTabletAndUp &&
          fieldsAreInvalid(["businessAddressState", "businessAddressZipCode", "businessAddressCity"])
            ? `error`
            : ""
        } input-error-bar grid-gap-1 grid-row margin-top-2`}
      >
        <div
          className={`${!isTabletAndUp ? "input-error-bar" : ""} ${
            fieldsAreInvalid(["businessAddressCity"]) ? "error" : ""
          } grid-col-12 tablet:grid-col-6 padding-left-0`}
        >
          <span className="text-bold">{Config.businessFormationDefaults.businessAddressCityLabel}</span>
          <FormationMunicipality />
        </div>

        <BusinessFormationTextField
          label={Config.businessFormationDefaults.businessAddressStateLabel}
          placeholder={Config.businessFormationDefaults.businessAddressStatePlaceholder}
          fieldName="businessAddressState"
          inlineErrorStyling={true}
          disabled={true}
          className={`${!isTabletAndUp ? "input-error-bar" : ""} ${
            fieldsAreInvalid(["businessAddressState", "businessAddressZipCode"]) ? `error` : ""
          } form-input grid-col-5 tablet:grid-col-2`}
        />
        <BusinessFormationTextField
          label={Config.businessFormationDefaults.businessAddressZipCodeLabel}
          placeholder={Config.businessFormationDefaults.businessAddressZipCodePlaceholder}
          numericProps={{
            maxLength: 5,
          }}
          required={true}
          inlineErrorStyling={true}
          fieldName={"businessAddressZipCode"}
          validationText={Config.businessFormationDefaults.businessAddressZipCodeErrorText}
          additionalValidation={zipCodeRange}
          className="form-input grid-col-7 tablet:grid-col-4"
        />
      </div>
    </>
  );
};
