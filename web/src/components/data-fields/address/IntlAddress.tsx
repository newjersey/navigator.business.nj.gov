import { CountryDropdown } from "@/components/CountryDropdown";
import { AddressLines1And2 } from "@/components/data-fields/address/AddressLines1And2";
import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { formatIntlPostalCode } from "@/lib/domain-logic/formatIntlPostalCode";
import { ReactElement, useContext } from "react";

interface Props {
  onValidation: () => void;
}

export const IntlAddress = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();
  const { state, setAddressData } = useContext(AddressContext);

  return (
    <>
      <AddressLines1And2 onValidation={props.onValidation} />
      <div className="text-field-width-default">
        <WithErrorBar
          hasError={doSomeFieldsHaveError(["addressCity", "addressProvince", "addressZipCode"])}
          type="DESKTOP-ONLY"
        >
          <div className="grid-row tablet:grid-gap-1">
            <div className="grid-col-12 tablet:grid-col-6">
              <WithErrorBar hasError={doesFieldHaveError("addressCity")} type="MOBILE-ONLY">
                <AddressTextField
                  fieldName="addressCity"
                  label={Config.formation.fields.addressCity.label}
                  errorBarType="ALWAYS"
                  onValidation={props.onValidation}
                  validationText={getFieldErrorLabel("addressCity")}
                />
              </WithErrorBar>
            </div>
            <div className="tablet:grid-col-6 margin-bottom-2">
              <AddressTextField
                fieldName="addressProvince"
                label={Config.formation.fields.addressProvince.label}
                errorBarType="MOBILE-ONLY"
                onValidation={props.onValidation}
                validationText={getFieldErrorLabel("addressProvince")}
                required={true}
              />
            </div>
          </div>
        </WithErrorBar>
        <WithErrorBar hasError={doSomeFieldsHaveError(["addressCountry"])} type="ALWAYS">
          <strong>
            <ModifiedContent>{Config.formation.fields.addressCountry.label}</ModifiedContent>
          </strong>
          <CountryDropdown
            fieldName="addressCountry"
            value={state.formationAddressData.addressCountry}
            onSelect={(country): void => {
              setAddressData((prevData) => {
                return {
                  ...prevData,
                  addressCountry: country?.shortCode,
                };
              });
            }}
            error={doesFieldHaveError("addressCountry")}
            validationText={Config.formation.fields.addressCountry.error}
            onValidation={props.onValidation}
            excludeUS
            useFullName
            required
          />
        </WithErrorBar>
        <div className="grid-row grid-gap-1 margin-top-2">
          <div className="tablet:grid-col-6">
            <AddressTextField
              fieldName="addressZipCode"
              label={Config.formation.fields.addressZipCode.foreign.label}
              valueFilter={formatIntlPostalCode}
              validationText={Config.formation.fields.addressZipCode.foreign.errorIntl}
              errorBarType="ALWAYS"
              onValidation={props.onValidation}
              required
            />
          </div>
        </div>
      </div>
    </>
  );
};
