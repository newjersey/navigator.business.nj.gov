import { IntlAddress } from "@/components/data-fields/address/IntlAddress";
import { NewJerseyAddress } from "@/components/data-fields/address/NewJerseyAddress";
import { UnitedStatesAddress } from "@/components/data-fields/address/UnitedStatesAddress";
import { ProfileAddressLockedFields } from "@/components/profile/ProfileAddressLockedFields";
import { AddressContext } from "@/contexts/addressContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
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
  const { doesFieldHaveError } = useAddressErrors();
  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidAddressLine2 } = useFormContextFieldHelpers(
    "addressLine2",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidCity } = useFormContextFieldHelpers(
    "addressCity",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidMunicipality } = useFormContextFieldHelpers(
    "addressMunicipality",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidProvince } = useFormContextFieldHelpers(
    "addressProvince",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidState } = useFormContextFieldHelpers(
    "addressState",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidCountry } = useFormContextFieldHelpers(
    "addressCountry",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers(
    "addressZipCode",
    DataFormErrorMapContext,
  );

  const handleAddressTypeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const businessLocationTypeValue = event.target.value as FormationBusinessLocationType;
    setAddressData({
      ...emptyFormationAddressData,
      businessLocationType: businessLocationTypeValue,
    });
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
        isStarting || isOwning
          ? "NJ"
          : (business.formationData.formationFormData.businessLocationType ?? "US");
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

          <div className="margin-y-4">
            {state.formationAddressData.businessLocationType === "INTL" && (
              <IntlAddress onValidation={onValidation} />
            )}
            {state.formationAddressData.businessLocationType === "NJ" && (
              <NewJerseyAddress onValidation={onValidation} />
            )}
            {state.formationAddressData.businessLocationType === "US" && (
              <UnitedStatesAddress onValidation={onValidation} />
            )}
          </div>
        </div>
      )}
      <hr aria-hidden={true} />
    </>
  );
};
