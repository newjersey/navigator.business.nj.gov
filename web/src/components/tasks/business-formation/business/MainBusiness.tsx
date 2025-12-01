import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { ForeignCertificate } from "@/components/tasks/business-formation/business/ForeignCertificate";
import { ForeignStateOfFormation } from "@/components/tasks/business-formation/business/ForeignStateOfFormation";
import { FormationDate } from "@/components/tasks/business-formation/business/FormationDate";
import { IsVeteranNonprofit } from "@/components/tasks/business-formation/business/IsVeteranNonprofit";
import { NonprofitProvisions } from "@/components/tasks/business-formation/business/NonprofitProvisions";
import { SuffixDropdown } from "@/components/tasks/business-formation/business/SuffixDropdown";
import { WillPracticeLaw } from "@/components/tasks/business-formation/business/WillPracticeLaw";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { isForeignCorporation, isForeignCorporationOrNonprofit } from "@/lib/utils/helpers";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext, useMemo } from "react";

export const MainBusiness = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();
  const isForeign = useMemo(
    () => state.formationFormData.businessLocationType !== "NJ",
    [state.formationFormData.businessLocationType],
  );

  return (
    <div>
      <BusinessNameAndLegalStructure />
      {isForeignCorporation(state.formationFormData.legalType) && (
        <WithErrorBar hasError={doesFieldHaveError("willPracticeLaw")} type="ALWAYS">
          <ScrollableFormFieldWrapper fieldName="willPracticeLaw">
            <WillPracticeLaw />
          </ScrollableFormFieldWrapper>
        </WithErrorBar>
      )}
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["businessSuffix", "businessStartDate"])}
        type="DESKTOP-ONLY"
      >
        <div className="grid-row grid-gap-1">
          <div className="margin-top-2 tablet:grid-col-6">
            <WithErrorBar hasError={doesFieldHaveError("businessSuffix")} type="MOBILE-ONLY">
              <ScrollableFormFieldWrapper fieldName="businessSuffix">
                <SuffixDropdown />
              </ScrollableFormFieldWrapper>
            </WithErrorBar>
          </div>
          <div className="margin-top-2 tablet:grid-col-6">
            <WithErrorBar hasError={doesFieldHaveError("businessStartDate")} type="MOBILE-ONLY">
              <ScrollableFormFieldWrapper fieldName="businessStartDate">
                <FormationDate fieldName="businessStartDate" />
              </ScrollableFormFieldWrapper>
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
                <WithErrorBar
                  hasError={doesFieldHaveError("foreignStateOfFormation")}
                  type="MOBILE-ONLY"
                >
                  <ScrollableFormFieldWrapper fieldName="foreignStateOfFormation">
                    <ForeignStateOfFormation />
                  </ScrollableFormFieldWrapper>
                </WithErrorBar>
              </div>
              <div className="margin-top-2 tablet:grid-col-6">
                <WithErrorBar
                  hasError={doesFieldHaveError("foreignDateOfFormation")}
                  type="MOBILE-ONLY"
                >
                  <ScrollableFormFieldWrapper fieldName="foreignDateOfFormation">
                    <FormationDate fieldName="foreignDateOfFormation" />
                  </ScrollableFormFieldWrapper>
                </WithErrorBar>
              </div>
            </div>
          </WithErrorBar>

          {isForeignCorporationOrNonprofit(state.formationFormData.legalType) && (
            <ScrollableFormFieldWrapper fieldName="foreignGoodStandingFile">
              <hr className="margin-bottom-2 margin-top-3" aria-hidden={true} />
              <ForeignCertificate hasError={doesFieldHaveError("foreignGoodStandingFile")} />
            </ScrollableFormFieldWrapper>
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
            <ScrollableFormFieldWrapper fieldName="businessTotalStock">
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
            </ScrollableFormFieldWrapper>
          </div>
        </div>
      )}
      <hr className="margin-y-3" aria-hidden={true} key={"business-line-1"} />
    </div>
  );
};
