import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { ForeignStateOfFormation } from "@/components/tasks/business-formation/business/ForeignStateOfFormation";
import { FormationDate } from "@/components/tasks/business-formation/business/FormationDate";
import { MainBusinessAddressNj } from "@/components/tasks/business-formation/business/MainBusinessAddressNj";
import { MainBusinessForeignAddressFlow } from "@/components/tasks/business-formation/business/MainBusinessForeignAddressFlow";
import { SuffixDropdown } from "@/components/tasks/business-formation/business/SuffixDropdown";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useMemo } from "react";

export const MainBusiness = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();
  const isForeign = useMemo(
    () => state.formationFormData.businessLocationType != "NJ",
    [state.formationFormData.businessLocationType]
  );

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
          <FormationDate fieldName="businessStartDate" />
        </div>
      </div>
      {isForeign && (
        <div
          className={`${isTabletAndUp ? "input-error-bar" : ""} ${
            doSomeFieldsHaveError(["foreignStateOfFormation", "foreignDateOfFormation"]) ? `error` : ""
          } grid-row tablet:grid-gap-1`}
        >
          <div
            className={`${isTabletAndUp ? "" : "input-error-bar"} ${
              doesFieldHaveError("foreignStateOfFormation") ? `error` : ""
            } tablet:grid-col-6`}
          >
            <ForeignStateOfFormation />
          </div>
          <div
            className={`${isTabletAndUp ? "" : "input-error-bar"} ${
              doesFieldHaveError("foreignDateOfFormation") ? `error` : ""
            } tablet:grid-col-6`}
          >
            <FormationDate fieldName="foreignDateOfFormation" />
          </div>
        </div>
      )}
      {corpLegalStructures.includes(state.formationFormData.legalType) && (
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
      )}
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      {isForeign ? <MainBusinessForeignAddressFlow /> : <MainBusinessAddressNj />}
    </>
  );
};
