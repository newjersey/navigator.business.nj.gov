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
import { MediaQueries } from "@/lib/PageSizes";
import { isForeignCorporation } from "@/lib/utils/helpers";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
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
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  return (
    <div className={"margin-bottom-4"}>
      <BusinessNameAndLegalStructure />
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["businessSuffix", "businessStartDate"])}
        type="DESKTOP-ONLY"
        className="grid-row tablet:grid-gap-1 margin-top-4"
      >
        <WithErrorBar
          hasError={doesFieldHaveError("businessSuffix")}
          type="MOBILE-ONLY"
          className="tablet:grid-col-6"
        >
          <SuffixDropdown />
        </WithErrorBar>
        <WithErrorBar
          hasError={doesFieldHaveError("businessStartDate")}
          type="MOBILE-ONLY"
          className="tablet:grid-col-6"
        >
          <FormationDate fieldName="businessStartDate" />
        </WithErrorBar>
      </WithErrorBar>
      {isForeign && (
        <>
          <WithErrorBar
            hasError={doSomeFieldsHaveError(["foreignStateOfFormation", "foreignDateOfFormation"])}
            type="DESKTOP-ONLY"
            className="grid-row tablet:grid-gap-1"
          >
            <WithErrorBar
              hasError={doesFieldHaveError("foreignStateOfFormation")}
              type="MOBILE-ONLY"
              className={`tablet:grid-col-6 ${isTabletAndUp ? "" : "margin-top-2"}`}
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
        <div className="grid-row">
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
            className="grid-col-6"
          />
          <div className="grid-col-6" />
        </div>
      )}
      <hr className="margin-bottom-4 margin-top-0" aria-hidden={true} />
      {isForeign ? <MainBusinessForeignAddressFlow /> : <MainBusinessAddressNj />}
    </div>
  );
};
