import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { AddressContext } from "@/contexts/addressContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { StateObject } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";
import { ProfileAddressLockedFields } from "./ProfileAddressLockedFields";

export const ProfileUsAddress = (): ReactElement => {
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
  const { setIsValid: setIsValidState } = useFormContextFieldHelpers("addressState", ProfileFormContext);
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers("addressZipCode", ProfileFormContext);

  useMountEffectWhenDefined(() => {
    if (business) {
      setAddressData({
        addressLine1: business.formationData.formationFormData.addressLine1,
        addressLine2: business.formationData.formationFormData.addressLine2,
        addressCity: business.formationData.formationFormData.addressCity,
        addressState: business.formationData.formationFormData.addressState,
        addressZipCode: business.formationData.formationFormData.addressZipCode,
      });
    }
  }, business);

  const onValidation = (): void => {
    setIsValidAddressLine1(!doesFieldHaveError("addressLine1"));
    setIsValidAddressLine2(!doesFieldHaveError("addressLine2"));
    setIsValidCity(!doesFieldHaveError("addressCity"));
    setIsValidState(!doesFieldHaveError("addressState"));
    setIsValidZipCode(!doesFieldHaveError("addressZipCode"));
  };

  const isAddressFieldsDisabled = business?.formationData.completedFilingPayment;
  console.log("isAddressFieldsDisabled US", isAddressFieldsDisabled);
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
                            value={state.addressData.addressState?.name}
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
        </div>
      )}
    </>
  );
};
