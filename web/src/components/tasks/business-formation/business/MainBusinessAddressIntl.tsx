import { CountryDropdown } from "@/components/CountryDropdown";
import { ModifiedContent } from "@/components/ModifiedContent";
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
    <>
      <BusinessFormationTextField
        label={Config.formation.fields.addressLine1.label}
        fieldName="addressLine1"
        required={true}
        className={"margin-bottom-2"}
        errorBarType="ALWAYS"
        validationText={getFieldErrorLabel("addressLine1")}
      />
      <BusinessFormationTextField
        label={Config.formation.fields.addressLine2.label}
        secondaryLabel={Config.formation.general.optionalLabel}
        errorBarType="ALWAYS"
        fieldName="addressLine2"
        validationText={getFieldErrorLabel("addressLine2")}
        className="margin-bottom-2"
      />
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["addressCity", "addressProvince"])}
        type="DESKTOP-ONLY"
        className="margin-bottom-2"
      >
        <div className="grid-row grid-gap-1">
          <div className="tablet:grid-col-6 margin-bottom-2 tablet:margin-bottom-0">
            <BusinessFormationTextField
              label={Config.formation.fields.addressCity.label}
              fieldName="addressCity"
              required={true}
              errorBarType="MOBILE-ONLY"
              validationText={getFieldErrorLabel("addressCity")}
            />
          </div>
          <div className="tablet:grid-col-6">
            <BusinessFormationTextField
              errorBarType="MOBILE-ONLY"
              label={Config.formation.fields.addressProvince.label}
              fieldName="addressProvince"
              required={true}
              validationText={getFieldErrorLabel("addressProvince")}
            />
          </div>
        </div>
      </WithErrorBar>
      <WithErrorBar hasError={doSomeFieldsHaveError(["addressCountry"])} type="ALWAYS">
        <strong>
          <ModifiedContent>{Config.formation.fields.addressCountry.label}</ModifiedContent>
        </strong>
        <CountryDropdown
          useFullName
          excludeUS
          fieldName="addressCountry"
          value={state.formationFormData.addressCountry}
          error={doesFieldHaveError("addressCountry")}
          validationText={Config.formation.fields.addressCountry.error}
          required
          onValidation={(): void => setFieldsInteracted(["addressCountry"])}
          onSelect={(country): void => {
            setFormationFormData((previousFormationData) => {
              return {
                ...previousFormationData,
                addressCountry: country?.shortCode,
              };
            });
            setFieldsInteracted(["addressCountry"]);
          }}
        />
      </WithErrorBar>

      <div className="grid-row grid-gap-1 margin-top-2">
        <div className="tablet:grid-col-6">
          <BusinessFormationTextField
            label={Config.formation.fields.addressZipCode.foreign.label}
            valueFilter={formatIntlPostalCode}
            errorBarType="ALWAYS"
            required={true}
            fieldName={"addressZipCode"}
            validationText={Config.formation.fields.addressZipCode.foreign.errorIntl}
          />
        </div>
      </div>
    </>
  );
};
