import { Content } from "@/components/Content";
import { StateDropdown } from "@/components/StateDropdown";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { MainBusinessAddressContainer } from "@/components/tasks/business-formation/business/MainBusinessAddressContainer";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import { useMountEffect } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const MainBusinessAddressNj = (): ReactElement => {
  const { setFormationFormData } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();

  useMountEffect(() => {
    setFormationFormData((previousState) => {
      return {
        ...previousState,
        addressState: { name: "New Jersey", shortCode: "NJ" },
        addressCountry: "US",
      };
    });
  });

  return (
    <MainBusinessAddressContainer>
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
          <span className="text-bold">{Config.businessFormationDefaults.addressMunicipalityLabel}</span>
          <FormationMunicipality />
        </div>
        <div
          className={`${isTabletAndUp ? "" : "input-error-bar"} ${
            doSomeFieldsHaveError(["addressState", "addressZipCode"]) ? `error` : ""
          } form-input grid-col-5 tablet:grid-col-2`}
        >
          <Content>{Config.businessFormationDefaults.addressStateLabel}</Content>
          <StateDropdown
            fieldName="addressState"
            value={"New Jersey"}
            placeholder={Config.businessFormationDefaults.addressModalStatePlaceholder}
            validationText={Config.businessFormationDefaults.addressStateErrorText}
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
    </MainBusinessAddressContainer>
  );
};
