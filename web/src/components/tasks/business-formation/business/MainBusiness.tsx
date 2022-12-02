import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { StateDropdown } from "@/components/StateDropdown";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { FormationStartDate } from "@/components/tasks/business-formation/business/FormationStartDate";
import { SuffixDropdown } from "@/components/tasks/business-formation/business/SuffixDropdown";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const MainBusiness = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();

  return (
    <>
      <BusinessNameAndLegalStructure />
      <div
        className={`${isTabletAndUp ? "input-error-bar" : ""} ${
          doSomeFieldsHaveError(["businessSuffix", "businessStartDate"]) ? `error` : ""
        } grid-row tablet:grid-gap-1`}
      >
        <div
          className={`${isTabletAndUp ? "" : "input-error-bar"} ${
            doesFieldHaveError("businessSuffix") ? `error` : ""
          } tablet:grid-col-6`}
        >
          <SuffixDropdown />
        </div>
        <div
          className={`${isTabletAndUp ? "" : "input-error-bar"} ${
            doesFieldHaveError("businessStartDate") ? `error` : ""
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
          <div className="grid-col-6" />
        </div>
      ) : (
        <></>
      )}
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <div className="margin-bottom-2">
        <Content>{Config.businessFormationDefaults.addressHeader}</Content>
      </div>
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.addressAddressLine1Label}
        placeholder={Config.businessFormationDefaults.addressAddressLine1Placeholder}
        fieldName="addressLine1"
        required={true}
        className={"margin-bottom-2"}
        noValidationMargin={true}
        validationText={Config.businessFormationDefaults.addressLine1ErrorText}
        formInputFull
      />
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.addressAddressLine2Label}
        placeholder={Config.businessFormationDefaults.addressAddressLine2Placeholder}
        fieldName="addressLine2"
        formInputFull
        className="margin-bottom-2"
      />

      <div
        className={`${
          isTabletAndUp && doSomeFieldsHaveError(["addressState", "addressZipCode", "addressMunicipality"])
            ? `error`
            : ""
        } input-error-bar grid-gap-1 grid-row margin-top-2`}
      >
        <div
          className={`${isTabletAndUp ? "" : "input-error-bar"} ${
            doesFieldHaveError("addressMunicipality") ? "error" : ""
          } grid-col-12 tablet:grid-col-6 padding-left-0`}
        >
          <span className="text-bold">{Config.businessFormationDefaults.addressCityLabel}</span>
          <FormationMunicipality />
        </div>
        <div
          className={`${isTabletAndUp ? "" : "input-error-bar"} ${
            doSomeFieldsHaveError(["addressState", "addressZipCode"]) ? `error` : ""
          } form-input grid-col-5 tablet:grid-col-2`}
        >
          <Content>{Config.businessFormationDefaults.addressMunicipalityLabel}</Content>
          <StateDropdown
            fieldName="addressState"
            value={"New Jersey"}
            placeholder={Config.businessFormationDefaults.addressModalStatePlaceholder}
            validationText={Config.businessFormationDefaults.addressStateErrorText}
            autoComplete="address-level1"
            disabled={true}
            onSelect={() => {}}
            className={"margin-top-2"}
          />
        </div>
        <BusinessFormationTextField
          label={Config.businessFormationDefaults.addressZipCodeLabel}
          placeholder={Config.businessFormationDefaults.addressZipCodePlaceholder}
          numericProps={{
            maxLength: 5,
          }}
          required={true}
          inlineErrorStyling={true}
          fieldName={"addressZipCode"}
          validationText={Config.businessFormationDefaults.addressZipCodeErrorText}
          className="form-input grid-col-7 tablet:grid-col-4"
        />
      </div>
      <Alert variant="info" className="margin-bottom-5">
        <Content>{Config.businessFormationDefaults.businessLocationInfoAlertMarkdown}</Content>
      </Alert>
    </>
  );
};
