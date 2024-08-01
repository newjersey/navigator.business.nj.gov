import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressMunicipalityDropdown } from "@/components/data-fields/address/AddressMunicipalityDropdown";
import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { AddressContext } from "@/contexts/addressContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  isOwningBusiness,
  isStartingBusiness,
} from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { ReactElement, useContext } from "react";

export const ProfileNewJerseyAddress = (): ReactElement => {
  const { Config } = useConfig();
  const { setAddressData } = useContext(AddressContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();
  const { business } = useUserData();

  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    ProfileFormContext
  );
  const { setIsValid: setIsValidAddressLine2 } = useFormContextFieldHelpers(
    "addressLine2",
    ProfileFormContext
  );
  const { setIsValid: setIsValidMunicipality } = useFormContextFieldHelpers(
    "addressMunicipality",
    ProfileFormContext
  );
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers("addressZipCode", ProfileFormContext);

  useMountEffectWhenDefined(() => {
    if (business && (isStartingBusiness(business) || isOwningBusiness(business))) {
      setAddressData({
        addressLine1: business.formationData.formationFormData.addressLine1,
        addressLine2: business.formationData.formationFormData.addressLine2,
        addressMunicipality: business.formationData.formationFormData.addressMunicipality,
        addressState: { name: "New Jersey", shortCode: "NJ" },
        addressZipCode: business.formationData.formationFormData.addressZipCode,
      });
    }
  }, business);

  const onValidation = (): void => {
    setIsValidAddressLine1(!doesFieldHaveError("addressLine1"));
    setIsValidAddressLine2(!doesFieldHaveError("addressLine2"));
    setIsValidMunicipality(!doesFieldHaveError("addressMunicipality"));
    setIsValidZipCode(!doesFieldHaveError("addressZipCode"));
  };

  const areAddressFieldsDisabled = (): boolean => {
    return business && isStartingBusiness(business) && business.formationData.completedFilingPayment
      ? true
      : false;
  };

  return (
    <>
      <div className="margin-y-4">
        <div id={`question-addressLine1`} className="text-field-width-default add-spacing-on-ele-scroll">
          <AddressTextField
            label={Config.formation.fields.addressLine1.label}
            fieldName="addressLine1"
            validationText={getFieldErrorLabel("addressLine1")}
            className={"margin-bottom-2"}
            errorBarType="ALWAYS"
            onValidation={onValidation}
            disabled={areAddressFieldsDisabled()}
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
            disabled={areAddressFieldsDisabled()}
          />
        </div>
        <div className="text-field-width-default">
          <WithErrorBar
            hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressMunicipality"])}
            type="DESKTOP-ONLY"
          >
            <div className="grid-row tablet:grid-gap-2">
              <div className="grid-col-12 tablet:grid-col-6">
                <WithErrorBar hasError={doesFieldHaveError("addressMunicipality")} type="MOBILE-ONLY">
                  <span className="text-bold">{Config.formation.fields.addressCity.label}</span>
                  <AddressMunicipalityDropdown
                    onValidation={onValidation}
                    disabled={areAddressFieldsDisabled()}
                  />
                </WithErrorBar>
              </div>
              <div className="grid-col-12 tablet:grid-col-6">
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
                          disabled={areAddressFieldsDisabled()}
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
      <hr aria-hidden={true} />
    </>
  );
};
