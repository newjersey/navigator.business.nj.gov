import { Content } from "@/components/Content";
import { CountryDropdown } from "@/components/CountryDropdown";
import { MainBusinessAddressContainer } from "@/components/tasks/business-formation/business/MainBusinessAddressContainer";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { formatIntlPostalCode } from "@/lib/domain-logic/formatIntlPostalCode";
import { ReactElement, useContext } from "react";

export const MainBusinessIntl = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useFormationErrors();

  return (
    <MainBusinessAddressContainer>
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["addressCity", "addressProvince"])}
        type="DESKTOP-ONLY"
        className="grid-row grid-gap-1 margin-top-2"
      >
        <div className="tablet:grid-col-6 grid-col-12">
          <BusinessFormationTextField
            label={Config.formation.fields.addressCity.label}
            placeholder={Config.formation.fields.addressCity.placeholder}
            fieldName="addressCity"
            required={true}
            errorBarType="MOBILE-ONLY"
            noValidationMargin={true}
            validationText={getFieldErrorLabel("addressCity")}
            formInputFull
          />
        </div>
        <div className="tablet:grid-col-6 grid-col-12">
          <BusinessFormationTextField
            errorBarType="MOBILE-ONLY"
            label={Config.formation.fields.addressProvince.label}
            placeholder={Config.formation.fields.addressProvince.placeholder}
            fieldName="addressProvince"
            required={true}
            noValidationMargin={true}
            validationText={getFieldErrorLabel("addressProvince")}
            formInputFull
          />
        </div>
      </WithErrorBar>
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["addressCountry"])}
        className="grid-col-12"
        type="ALWAYS"
      >
        <Content>{Config.formation.fields.addressCountry.label}</Content>
        <CountryDropdown
          useFullName
          excludeUS
          fieldName="addressCountry"
          value={state.formationFormData.addressCountry}
          error={doesFieldHaveError("addressCountry")}
          placeholder={Config.formation.fields.addressCountry.placeholder}
          validationText={Config.formation.fields.addressCountry.error}
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
      </WithErrorBar>

      <BusinessFormationTextField
        label={Config.formation.fields.addressZipCode.foreign.label}
        placeholder={Config.formation.fields.addressZipCode.foreign.placeholder}
        valueFilter={formatIntlPostalCode}
        errorBarType="ALWAYS"
        required={true}
        fieldName={"addressZipCode"}
        validationText={Config.formation.fields.addressZipCode.foreign.errorIntl}
        className="tablet:grid-col-6 grid-col-12"
      />
    </MainBusinessAddressContainer>
  );
};
