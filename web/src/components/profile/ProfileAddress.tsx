import { CountryDropdown } from "@/components/CountryDropdown";
import { AddressMunicipalityDropdown } from "@/components/data-fields/address/AddressMunicipalityDropdown";
import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { ProfileAddressLockedFields } from "@/components/profile/ProfileAddressLockedFields";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { formatIntlPostalCode } from "@/lib/domain-logic/formatIntlPostalCode";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { FormationBusinessLocationType } from "@businessnjgovnavigator/shared";
import { emptyFormationAddressData } from "@businessnjgovnavigator/shared/formationData";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const ProfileAddress = (): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  const { state, setAddressData } = useContext(AddressContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();
  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    ProfileFormContext
  );
  const { setIsValid: setIsValidAddressLine2 } = useFormContextFieldHelpers(
    "addressLine2",
    ProfileFormContext
  );
  const { setIsValid: setIsValidCity } = useFormContextFieldHelpers("addressCity", ProfileFormContext);
  const { setIsValid: setIsValidMunicipality } = useFormContextFieldHelpers(
    "addressMunicipality",
    ProfileFormContext
  );
  const { setIsValid: setIsValidProvince } = useFormContextFieldHelpers(
    "addressProvince",
    ProfileFormContext
  );
  const { setIsValid: setIsValidState } = useFormContextFieldHelpers("addressState", ProfileFormContext);
  const { setIsValid: setIsValidCountry } = useFormContextFieldHelpers("addressCountry", ProfileFormContext);
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers("addressZipCode", ProfileFormContext);

  const handleAddressTypeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const businessLocationTypeValue = event.target.value as FormationBusinessLocationType;
    setAddressData({ ...emptyFormationAddressData, businessLocationType: businessLocationTypeValue });
  };

  const isAddressFieldsDisabled = business?.formationData.completedFilingPayment;

  const onValidation = (): void => {
    setIsValidAddressLine1(!doesFieldHaveError("addressLine1"));
    setIsValidAddressLine2(!doesFieldHaveError("addressLine2"));
    if (state.formationAddressData.businessLocationType === "NJ")
      setIsValidMunicipality(!doesFieldHaveError("addressMunicipality"));
    if (
      state.formationAddressData.businessLocationType === "US" ||
      state.formationAddressData.businessLocationType === "INTL"
    )
      setIsValidCity(!doesFieldHaveError("addressCity"));
    if (state.formationAddressData.businessLocationType === "US")
      setIsValidState(!doesFieldHaveError("addressState"));
    if (state.formationAddressData.businessLocationType === "INTL") {
      setIsValidProvince(!doesFieldHaveError("addressProvince"));
      setIsValidCountry(!doesFieldHaveError("addressCountry"));
    }
    setIsValidZipCode(!doesFieldHaveError("addressZipCode"));
  };

  useMountEffectWhenDefined(() => {
    if (business) {
      const isStarting = business.profileData.businessPersona === "STARTING";
      const isOwning = business.profileData.businessPersona === "OWNING";
      const addressState: StateObject | undefined =
        isStarting || isOwning
          ? { name: "New Jersey", shortCode: "NJ" }
          : business.formationData.formationFormData.addressState;

      const businessLocationType =
        isStarting || isOwning ? "NJ" : business.formationData.formationFormData.businessLocationType ?? "US";
      setAddressData({
        addressLine1: business.formationData.formationFormData.addressLine1,
        addressLine2: business.formationData.formationFormData.addressLine2,
        addressCity: business.formationData.formationFormData.addressCity,
        addressMunicipality: business.formationData.formationFormData.addressMunicipality,
        addressState,
        addressZipCode: business.formationData.formationFormData.addressZipCode,
        addressCountry: business.formationData.formationFormData.addressCountry,
        addressProvince: business.formationData.formationFormData.addressProvince,
        businessLocationType: businessLocationType,
      });
    }
  }, business);

  const addressLines1And2 = (): ReactElement => {
    return (
      <>
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
      </>
    );
  };

  const showAddressFields = (): ReactElement => {
    switch (state.formationAddressData.businessLocationType) {
      case "INTL":
        return (
          <>
            {addressLines1And2()}
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
          </>
        );
      case "NJ":
        return (
          <>
            {addressLines1And2()}
            <div className="text-field-width-default">
              <WithErrorBar
                hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressMunicipality"])}
                type="DESKTOP-ONLY"
              >
                <div className="grid-row tablet:grid-gap-2">
                  <div className="grid-col-12 tablet:grid-col-6">
                    <WithErrorBar hasError={doesFieldHaveError("addressMunicipality")} type="MOBILE-ONLY">
                      <span className="text-bold">{Config.formation.fields.addressCity.label}</span>
                      <AddressMunicipalityDropdown onValidation={onValidation} />
                    </WithErrorBar>
                  </div>
                  <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
                    <WithErrorBar
                      hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}
                      type="MOBILE-ONLY"
                    >
                      <div className="grid-row grid-gap tablet:grid-gap-2">
                        <div className="grid-col-6">
                          <strong>
                            <ModifiedContent>{Config.formation.fields.addressState.label}</ModifiedContent>
                          </strong>
                          <div
                            id={`question-addressState`}
                            className="text-field-width-default add-spacing-on-ele-scroll"
                          >
                            <StateDropdown
                              fieldName="addressState"
                              value={"New Jersey"}
                              validationText={Config.formation.fields.addressState.error}
                              disabled={true}
                              onSelect={(): void => {}}
                            />
                          </div>
                        </div>
                        <div className="grid-col-6">
                          <div
                            id={`question-addressZipCode`}
                            className="text-field-width-default add-spacing-on-ele-scroll"
                          >
                            <AddressTextField
                              label={Config.formation.fields.addressZipCode.label}
                              numericProps={{ maxLength: 5 }}
                              errorBarType="NEVER"
                              validationText={getFieldErrorLabel("addressZipCode")}
                              fieldName={"addressZipCode"}
                              onValidation={onValidation}
                            />
                          </div>
                        </div>
                      </div>
                    </WithErrorBar>
                  </div>
                </div>
              </WithErrorBar>
            </div>
          </>
        );
      case "US":
        return (
          <>
            {addressLines1And2()}
            <div className="text-field-width-default">
              <WithErrorBar
                hasError={doSomeFieldsHaveError(["addressCity", "addressState", "addressZipCode"])}
                type="DESKTOP-ONLY"
              >
                <div className="grid-row tablet:grid-gap-2">
                  <div className="grid-col-12 tablet:grid-col-6">
                    <WithErrorBar hasError={doesFieldHaveError("addressCity")} type="MOBILE-ONLY">
                      <AddressTextField
                        label={Config.formation.fields.addressCity.label}
                        fieldName="addressCity"
                        validationText={getFieldErrorLabel("addressCity")}
                        errorBarType="ALWAYS"
                        onValidation={onValidation}
                      />
                    </WithErrorBar>
                  </div>
                  <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
                    <WithErrorBar
                      hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}
                      type="MOBILE-ONLY"
                    >
                      <div className="grid-row grid-gap tablet:grid-gap-2">
                        <div className="grid-col-6">
                          <strong>
                            <ModifiedContent>{Config.formation.fields.addressState.label}</ModifiedContent>
                          </strong>
                          <div
                            id={`question-addressState`}
                            className="text-field-width-default add-spacing-on-ele-scroll"
                          >
                            <StateDropdown
                              fieldName="addressState"
                              value={state.formationAddressData.addressState?.name}
                              validationText={Config.formation.fields.foreignStateOfFormation.error}
                              onSelect={(value: StateObject | undefined): void => {
                                setAddressData((prevAddressData) => {
                                  return { ...prevAddressData, addressState: value };
                                });
                              }}
                              error={doesFieldHaveError("addressState")}
                              disabled={false}
                              onValidation={onValidation}
                              excludeNJ
                            />
                          </div>
                        </div>
                        <div className="grid-col-6">
                          <div
                            id={`question-addressZipCode`}
                            className="text-field-width-default add-spacing-on-ele-scroll"
                          >
                            <AddressTextField
                              label={Config.formation.fields.addressZipCode.label}
                              numericProps={{ maxLength: 5 }}
                              errorBarType="NEVER"
                              validationText={getFieldErrorLabel("addressZipCode")}
                              fieldName={"addressZipCode"}
                              onValidation={onValidation}
                            />
                          </div>
                        </div>
                      </div>
                    </WithErrorBar>
                  </div>
                </div>
              </WithErrorBar>
            </div>
          </>
        );
      default:
        return <></>;
    }
  };

  return (
    <>
      {isAddressFieldsDisabled ? (
        <ProfileAddressLockedFields />
      ) : (
        <div>
          <div className="text-bold margin-top-3">
            {Config.profileDefaults.fields.businessAddress.default.header}
          </div>
          {state.formationAddressData.businessLocationType !== "NJ" && (
            <FormControl fullWidth>
              <RadioGroup
                name="business-address"
                value={state.formationAddressData.businessLocationType ?? ""}
                onChange={handleAddressTypeChange}
              >
                <FormControlLabel
                  labelPlacement="end"
                  style={{ alignItems: "center" }}
                  data-testid="profile-us-address"
                  value="US"
                  control={<Radio color="primary" />}
                  label={Config.profileDefaults.fields.businessAddress.default.usAddress}
                />
                <FormControlLabel
                  labelPlacement="end"
                  style={{ alignItems: "center" }}
                  data-testid="profile-intl-address"
                  value="INTL"
                  control={<Radio color="primary" />}
                  label={Config.profileDefaults.fields.businessAddress.default.intlAddress}
                />
              </RadioGroup>
            </FormControl>
          )}

          <div className="margin-y-4">{showAddressFields()}</div>
        </div>
      )}
    </>
  );
};
