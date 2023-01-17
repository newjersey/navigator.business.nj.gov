import { Content } from "@/components/Content";
import { CountryDropdown } from "@/components/CountryDropdown";
import { MainBusinessAddressContainer } from "@/components/tasks/business-formation/business/MainBusinessAddressContainer";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const MainBusinessIntl = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();

  return (
    <MainBusinessAddressContainer>
      <div
        className={`${isTabletAndUp ? "input-error-bar grid-row grid-gap-1" : ""} ${
          doSomeFieldsHaveError(["addressCity", "addressProvince"]) ? " error " : ""
        } margin-top-2`}
      >
        <BusinessFormationTextField
          label={Config.businessFormationDefaults.addressCityLabel}
          placeholder={Config.businessFormationDefaults.addressCityPlaceholder}
          fieldName="addressCity"
          required={true}
          inlineErrorStyling={isTabletAndUp}
          className={`margin-bottom-2 ${isTabletAndUp ? "grid-col-6" : "grid-col-12"}`}
          noValidationMargin={true}
          validationText={Config.businessFormationDefaults.addressCityErrorText}
          formInputFull
        />

        <BusinessFormationTextField
          label={Config.businessFormationDefaults.addressProvinceLabel}
          placeholder={Config.businessFormationDefaults.addressProvincePlaceholder}
          fieldName="addressProvince"
          required={true}
          noValidationMargin={true}
          inlineErrorStyling={isTabletAndUp}
          validationText={Config.businessFormationDefaults.addressProvinceErrorText}
          formInputFull
          className={`margin-bottom-2 ${isTabletAndUp ? "grid-col-6" : "grid-col-12"}`}
        />
      </div>
      <div
        className={`input-error-bar ${doSomeFieldsHaveError(["addressCountry"]) ? `error` : ""} grid-col-12`}
      >
        <>
          <Content>{Config.businessFormationDefaults.addressCountryLabel}</Content>

          <CountryDropdown
            useFullName
            excludeUS
            fieldName="addressCountry"
            value={state.formationFormData.addressCountry}
            error={doesFieldHaveError("addressCountry")}
            placeholder={Config.businessFormationDefaults.addressCountryPlaceholder}
            validationText={Config.businessFormationDefaults.addressCountryErrorText}
            required
            onValidation={() => setFieldsInteracted(["addressCountry"])}
            onSelect={(country) => {
              setFormationFormData((previousFormationData) => {
                return {
                  ...previousFormationData,
                  addressCountry: country?.shortCode,
                };
              });
              setFieldsInteracted(["addressCountry"]);
            }}
            className={"margin-top-2"}
          />
        </>
      </div>

      <BusinessFormationTextField
        label={Config.businessFormationDefaults.addressZipCodeIntlDakotaLabel}
        placeholder={Config.businessFormationDefaults.addressZipCodeIntlDakotaPlaceholder}
        numericProps={{
          maxLength: 11,
        }}
        required={true}
        fieldName={"addressZipCode"}
        validationText={Config.businessFormationDefaults.addressZipCodeIntlDakotaErrorText}
        className=" grid-col-6"
      />
    </MainBusinessAddressContainer>
  );
};
