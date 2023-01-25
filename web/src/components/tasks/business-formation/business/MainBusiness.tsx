import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { ForeignStateOfFormation } from "@/components/tasks/business-formation/business/ForeignStateOfFormation";
import { FormationDate } from "@/components/tasks/business-formation/business/FormationDate";
import { MainBusinessAddressNj } from "@/components/tasks/business-formation/business/MainBusinessAddressNj";
import { MainBusinessForeignAddressFlow } from "@/components/tasks/business-formation/business/MainBusinessForeignAddressFlow";
import { SuffixDropdown } from "@/components/tasks/business-formation/business/SuffixDropdown";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext, useMemo } from "react";

export const MainBusiness = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();
  const isForeign = useMemo(
    () => state.formationFormData.businessLocationType != "NJ",
    [state.formationFormData.businessLocationType]
  );

  return (
    <>
      <BusinessNameAndLegalStructure />
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["businessSuffix", "businessStartDate"])}
        type="DESKTOP-ONLY"
        className="grid-row tablet:grid-gap-1"
      >
        <WithErrorBar
          hasError={doesFieldHaveError("businessSuffix")}
          type="MOBILE-ONLY"
          className="tablet:grid-col-6"
        >
          <SuffixDropdown />
        </WithErrorBar>
        <WithErrorBar
          hasError={doesFieldHaveError("businessSuffix")}
          type="MOBILE-ONLY"
          className="tablet:grid-col-6"
        >
          <FormationDate fieldName="businessStartDate" />
        </WithErrorBar>
      </WithErrorBar>
      {isForeign && (
        <WithErrorBar
          hasError={doSomeFieldsHaveError(["foreignStateOfFormation", "foreignDateOfFormation"])}
          type="DESKTOP-ONLY"
          className="grid-row tablet:grid-gap-1"
        >
          <WithErrorBar
            hasError={doesFieldHaveError("foreignStateOfFormation")}
            type="MOBILE-ONLY"
            className="tablet:grid-col-6"
          >
            <ForeignStateOfFormation />
          </WithErrorBar>
          <WithErrorBar
            hasError={doesFieldHaveError("foreignDateOfFormation")}
            type="MOBILE-ONLY"
            className="tablet:grid-col-6"
          >
            <FormationDate fieldName="foreignDateOfFormation" />
          </WithErrorBar>
        </WithErrorBar>
      )}
      {corpLegalStructures.includes(state.formationFormData.legalType) && (
        <div className="grid-row">
          <BusinessFormationTextField
            errorBarType="ALWAYS"
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
