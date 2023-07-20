import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { ForeignStateOfFormation } from "@/components/tasks/business-formation/business/ForeignStateOfFormation";
import { FormationDate } from "@/components/tasks/business-formation/business/FormationDate";
import { MainBusinessAddressNj } from "@/components/tasks/business-formation/business/MainBusinessAddressNj";
import { MainBusinessForeignAddressFlow } from "@/components/tasks/business-formation/business/MainBusinessForeignAddressFlow";
import { SuffixDropdown } from "@/components/tasks/business-formation/business/SuffixDropdown";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { isForeignCorporation } from "@/lib/utils/helpers";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext, useMemo } from "react";
import { ForeignCertificate } from "./ForeignCertificate";
import { PracticesLaw } from "./PracticesLaw";

export const MainBusiness = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();
  const isForeign = useMemo(
    () => state.formationFormData.businessLocationType !== "NJ",
    [state.formationFormData.businessLocationType]
  );

  return (
    <div className={"margin-bottom-4"}>
      <BusinessNameAndLegalStructure />
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["businessSuffix", "businessStartDate"])}
        type="DESKTOP-ONLY"
      >
        <div className="grid-row grid-gap-1">
          <div className="margin-top-2 tablet:grid-col-6">
            <WithErrorBar hasError={doesFieldHaveError("businessSuffix")} type="MOBILE-ONLY">
              <SuffixDropdown />
            </WithErrorBar>
          </div>
          <div className="margin-top-2 tablet:grid-col-6">
            <WithErrorBar hasError={doesFieldHaveError("businessStartDate")} type="MOBILE-ONLY">
              <FormationDate fieldName="businessStartDate" />
            </WithErrorBar>
          </div>
        </div>
      </WithErrorBar>
      {isForeign && (
        <>
          <WithErrorBar
            hasError={doSomeFieldsHaveError(["foreignStateOfFormation", "foreignDateOfFormation"])}
            type="DESKTOP-ONLY"
          >
            <div className="grid-row grid-gap-1">
              <div className="margin-top-2 tablet:grid-col-6">
                <WithErrorBar hasError={doesFieldHaveError("foreignStateOfFormation")} type="MOBILE-ONLY">
                  <ForeignStateOfFormation />
                </WithErrorBar>
              </div>
              <div className="margin-top-2 tablet:grid-col-6">
                <WithErrorBar hasError={doesFieldHaveError("foreignDateOfFormation")} type="MOBILE-ONLY">
                  <FormationDate fieldName="foreignDateOfFormation" />
                </WithErrorBar>
              </div>
            </div>
          </WithErrorBar>

          {isForeignCorporation(state.formationFormData.legalType) && (
            <>
              <WithErrorBar hasError={doesFieldHaveError("willPracticeLaw")} type="ALWAYS">
                <PracticesLaw hasError={doesFieldHaveError("willPracticeLaw")} />
              </WithErrorBar>
              <ForeignCertificate hasError={doesFieldHaveError("foreignGoodStandingFile")} />
            </>
          )}
        </>
      )}
      {corpLegalStructures.includes(state.formationFormData.legalType) && (
        <div className="grid-row grid-gap-1">
          <div className="margin-top-2 tablet:grid-col-6">
            <BusinessFormationTextField
              errorBarType="ALWAYS"
              label={Config.formation.fields.businessTotalStock.label}
              numericProps={{
                minLength: 1,
                trimLeadingZeroes: true,
                maxLength: 11,
              }}
              required={true}
              fieldName={"businessTotalStock"}
              validationText={Config.formation.fields.businessTotalStock.error}
            />
          </div>
        </div>
      )}
      <hr className="margin-bottom-4 margin-top-4" aria-hidden={true} />
      {isForeign ? <MainBusinessForeignAddressFlow /> : <MainBusinessAddressNj />}
    </div>
  );
};
