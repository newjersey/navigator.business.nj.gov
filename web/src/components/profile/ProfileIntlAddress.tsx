import { CountryDropdown } from "@/components/CountryDropdown";
import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { ProfileAddressLockedFields } from "@/components/profile/ProfileAddressLockedFields";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { formatIntlPostalCode } from "@/lib/domain-logic/formatIntlPostalCode";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

export const ProfileIntlAddress = (): ReactElement => {
  const { state, setAddressData } = useContext(AddressContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();
  const { business } = useUserData();
  const { Config } = useConfig();

  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    ProfileFormContext
  );
  const { setIsValid: setIsValidAddressLine2 } = useFormContextFieldHelpers(
    "addressLine2",
    ProfileFormContext
  );
  const { setIsValid: setIsValidCity } = useFormContextFieldHelpers("addressCity", ProfileFormContext);
  const { setIsValid: setIsValidProvince } = useFormContextFieldHelpers(
    "addressProvince",
    ProfileFormContext
  );
  const { setIsValid: setIsValidZipCountry } = useFormContextFieldHelpers(
    "addressCountry",
    ProfileFormContext
  );
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers("addressZipCode", ProfileFormContext);

  const onValidation = (): void => {
    setIsValidAddressLine1(!doesFieldHaveError("addressLine1"));
    setIsValidAddressLine2(!doesFieldHaveError("addressLine2"));
    setIsValidCity(!doesFieldHaveError("addressCity"));
    setIsValidProvince(!doesFieldHaveError("addressProvince"));
    setIsValidZipCountry(!doesFieldHaveError("addressCountry"));
    setIsValidZipCode(!doesFieldHaveError("addressZipCode"));
  };

  useMountEffectWhenDefined(() => {
    console.log("biz", business);
    if (business) {
      setAddressData({
        addressLine1: business.formationData.formationFormData.addressLine1,
        addressLine2: business.formationData.formationFormData.addressLine2,
        addressCity: business.formationData.formationFormData.addressCity,
        addressProvince: business.formationData.formationFormData.addressProvince,
        addressCountry: business.formationData.formationFormData.addressCountry,
        addressZipCode: business.formationData.formationFormData.addressZipCode,
      });
    }
  }, business);

  const isAddressFieldsDisabled = business?.formationData.completedFilingPayment;
  console.log("isAddressFieldsDisabled Intl", isAddressFieldsDisabled);

  return (
    <>
      {isAddressFieldsDisabled ? (
        <ProfileAddressLockedFields />
      ) : (
        <div className="margin-y-4">
          <div id={`question-addressLine1`} className="text-field-width-default add-spacing-on-ele-scroll">
            <AddressTextField
              label={Config.formation.fields.addressLine1.label}
              fieldName="addressLine1"
              validationText={getFieldErrorLabel("addressLine1")}
              className={"margin-bottom-2"}
              errorBarType="ALWAYS"
              onValidation={onValidation}
            />
          </div>
          <div id={`question-addressLine2`} className="text-field-width-default add-spacing-on-ele-scroll">
            <AddressTextField
              label={Config.formation.fields.addressLine2.label}
              secondaryLabel={Config.formation.general.optionalLabel}
              errorBarType="ALWAYS"
              fieldName="addressLine2"
              validationText={getFieldErrorLabel("addressLine2")}
              className="margin-bottom-2"
              onValidation={onValidation}
            />
          </div>
          <div className="text-field-width-default">
            <WithErrorBar
              hasError={doSomeFieldsHaveError(["addressCity", "addressProvince"])}
              type="DESKTOP-ONLY"
            >
              <div className="grid-row tablet:grid-gap-1">
                <div className="grid-col-12 tablet:grid-col-6">
                  <WithErrorBar hasError={doesFieldHaveError("addressCity")} type="MOBILE-ONLY">
                    <AddressTextField
                      fieldName="addressCity"
                      label={Config.formation.fields.addressCity.label}
                      errorBarType="ALWAYS"
                      onValidation={onValidation}
                      validationText={getFieldErrorLabel("addressCity")}
                    />
                  </WithErrorBar>
                </div>
                <div className="tablet:grid-col-6 margin-bottom-2">
                  <AddressTextField
                    fieldName="addressProvince"
                    label={Config.formation.fields.addressProvince.label}
                    errorBarType="MOBILE-ONLY"
                    onValidation={onValidation}
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
                value={state.addressData.addressCountry}
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
                onValidation={onValidation}
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
                  onValidation={onValidation}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
