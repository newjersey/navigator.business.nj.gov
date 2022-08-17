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
        className={`${
          isTabletAndUp && fieldsAreInvalid(["businessSuffix", "businessStartDate"]) ? `input-error-bar ` : ""
        } grid-row tablet:grid-gap-1`}
      >
        <div
          className={`${
            !isTabletAndUp && fieldsAreInvalid(["businessSuffix"]) ? `input-error-bar ` : ""
          } tablet:grid-col-6`}
        >
          <SuffixDropdown />
        </div>
        <div
          className={`${
            !isTabletAndUp && fieldsAreInvalid(["businessStartDate"]) ? `input-error-bar ` : ""
          } tablet:grid-col-6 margin-bottom-2`}
        >
          <FormationStartDate />
        </div>
      </div>
      {corpLegalStructures.includes(state.legalStructureId) ? (
        <div className="grid-row tablet:grid-gap-2">
          <div className="tablet:grid-col-6">
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
            />{" "}
          </div>
          <div className="tablet:grid-col-6 margin-bottom-2"></div>
        </div>
      ) : (
        <></>
      )}
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <div className="margin-bottom-2">
        <Content>{Config.businessFormationDefaults.businessAddressHeader}</Content>
      </div>
      <div>
        <BusinessFormationTextField
          label={Config.businessFormationDefaults.businessAddressAddressLine1Label}
          placeholder={Config.businessFormationDefaults.businessAddressAddressLine1Placeholder}
          fieldName="businessAddressLine1"
          required={true}
          validationText={Config.businessFormationDefaults.businessAddressLine1ErrorText}
          formInputFull
        />
      </div>
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.businessAddressAddressLine2Label}
        placeholder={Config.businessFormationDefaults.businessAddressAddressLine2Placeholder}
        fieldName="businessAddressLine2"
        formInputFull
      />

      <div
        className={`${
          isTabletAndUp &&
          fieldsAreInvalid(["businessAddressState", "businessAddressZipCode", "businessAddressCity"])
            ? `input-error-bar`
            : ""
        } tablet:grid-gap-1 grid-row margin-top-2`}
      >
        <div
          className={`${
            !isTabletAndUp && fieldsAreInvalid(["businessAddressCity"]) ? `input-error-bar` : ""
          } margin-bottom-2 grid-col-12 tablet:grid-col-6 padding-left-0`}
        >
          <span className="text-bold margin-bottom-2">
            {Config.businessFormationDefaults.businessAddressCityLabel}
          </span>
          <FormationMunicipality />
        </div>
        <div
          className={`${
            !isTabletAndUp && fieldsAreInvalid(["businessAddressState", "businessAddressZipCode"])
              ? `input-error-bar`
              : ""
          } margin-bottom-2 form-input grid-col-5 tablet:grid-col-2`}
        >
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.businessAddressStateLabel}
            placeholder={Config.businessFormationDefaults.businessAddressStatePlaceholder}
            fieldName="businessAddressState"
            disabled={true}
          />
        </div>
        <div className="margin-bottom-2 form-input grid-col-7 tablet:grid-col-4">
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
          />
        </div>
      </div>
    </>
  );
};
