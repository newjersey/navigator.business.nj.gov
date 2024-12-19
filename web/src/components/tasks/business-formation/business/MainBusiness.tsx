import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { ForeignCertificate } from "@/components/tasks/business-formation/business/ForeignCertificate";
import { ForeignStateOfFormation } from "@/components/tasks/business-formation/business/ForeignStateOfFormation";
import { FormationDate } from "@/components/tasks/business-formation/business/FormationDate";
import { IsVeteranNonprofit } from "@/components/tasks/business-formation/business/IsVeteranNonprofit";
import { NonprofitProvisions } from "@/components/tasks/business-formation/business/NonprofitProvisions";
import { SuffixDropdown } from "@/components/tasks/business-formation/business/SuffixDropdown";
import { WillPracticeLaw } from "@/components/tasks/business-formation/business/WillPracticeLaw";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationField } from "@/components/tasks/business-formation/FormationField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { isForeignCorporation, isForeignCorporationOrNonprofit } from "@/lib/utils/helpers";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext, useMemo } from "react";

export const MainBusiness = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();
  const isForeign = useMemo(
    () => state.formationFormData.businessLocationType !== "NJ",
    [state.formationFormData.businessLocationType]
  );

  return (
    <div>
      <BusinessNameAndLegalStructure />
      {isForeignCorporation(state.formationFormData.legalType) && (
        <WithErrorBar hasError={doesFieldHaveError("willPracticeLaw")} type="ALWAYS">
          <FormationField fieldName="willPracticeLaw">
            <WillPracticeLaw />
          </FormationField>
        </WithErrorBar>
      )}
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["businessSuffix", "businessStartDate"])}
        type="DESKTOP-ONLY"
      >
        <div className="grid-row grid-gap-1">
          <div className="margin-top-2 tablet:grid-col-6">
            <WithErrorBar hasError={doesFieldHaveError("businessSuffix")} type="MOBILE-ONLY">
              <FormationField fieldName="businessSuffix">
                <SuffixDropdown />
              </FormationField>
            </WithErrorBar>
          </div>
          <div className="margin-top-2 tablet:grid-col-6">
            <WithErrorBar hasError={doesFieldHaveError("businessStartDate")} type="MOBILE-ONLY">
              <FormationField fieldName="businessStartDate">
                <FormationDate fieldName="businessStartDate" />
              </FormationField>
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
                  <FormationField fieldName="foreignStateOfFormation">
                    <ForeignStateOfFormation />
                  </FormationField>
                </WithErrorBar>
              </div>
              <div className="margin-top-2 tablet:grid-col-6">
                <WithErrorBar hasError={doesFieldHaveError("foreignDateOfFormation")} type="MOBILE-ONLY">
                  <FormationField fieldName="foreignDateOfFormation">
                    <FormationDate fieldName="foreignDateOfFormation" />
                  </FormationField>
                </WithErrorBar>
              </div>
            </div>
          </WithErrorBar>

          {isForeignCorporationOrNonprofit(state.formationFormData.legalType) && (
            <FormationField fieldName="foreignGoodStandingFile">
              <hr className="margin-bottom-2 margin-top-3" aria-hidden={true} />
              <ForeignCertificate hasError={doesFieldHaveError("foreignGoodStandingFile")} />
            </FormationField>
          )}
        </>
      )}
      {state.formationFormData.legalType === "nonprofit" && (
        <>
          <div className="grid-row">
            <IsVeteranNonprofit />
          </div>
          <hr className="margin-y-3" />
          <NonprofitProvisions />
        </>
      )}
      {corpLegalStructures.includes(state.formationFormData.legalType) && (
        <div className="grid-row grid-gap-1">
          <div className="margin-top-2 tablet:grid-col-6">
            <FormationField fieldName="businessTotalStock">
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
            </FormationField>
          </div>
        </div>
      )}
      <hr className="margin-y-3" aria-hidden={true} key={"business-line-1"} />
    </div>
  );
};
