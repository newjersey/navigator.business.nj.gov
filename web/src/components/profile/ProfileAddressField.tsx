import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileAddressTextField } from "@/components/profile/ProfileAddressTextField";
import { ProfileMunicipality } from "@/components/profile/ProfileMunicipality";
import { AddressContext } from "@/contexts/addressContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { isOwningBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { ReactElement, useContext } from "react";

export const ProfileAddressField = (): ReactElement => {
  const { Config } = useConfig();
  const { setAddressData } = useContext(AddressContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();
  const { business } = useUserData();

  useMountEffectWhenDefined(() => {
    if (business && isOwningBusiness(business)) {
      setAddressData({
        addressLine1: business.formationData.formationFormData.addressLine1,
        addressLine2: business.formationData.formationFormData.addressLine2,
        addressCity: business.formationData.formationFormData.addressCity,
        addressMunicipality: business.formationData.formationFormData.addressMunicipality,
        addressState: { name: "New Jersey", shortCode: "NJ" },
        addressZipCode: business.formationData.formationFormData.addressZipCode,
        addressCountry: "US",
        addressProvince: business.formationData.formationFormData.addressProvince,
        businessLocationType: business.formationData.formationFormData.businessLocationType,
      });
    }
  }, business);

  return (
    <>
      <>
        <div id={`question-addressLine1`} className="text-field-width-default add-spacing-on-ele-scroll">
          <ProfileAddressTextField
            label={Config.profileDefaults.fields.addressLine1.label}
            fieldName="addressLine1"
            required={true}
            validationText={getFieldErrorLabel("addressLine1")}
            className={"margin-bottom-2"}
            errorBarType="ALWAYS"
          />
        </div>

        <div id={`question-addressLine2`} className="text-field-width-default add-spacing-on-ele-scroll">
          <ProfileAddressTextField
            label={Config.profileDefaults.fields.addressLine2.label}
            secondaryLabel={Config.profileDefaults.fields.general.optionalLabel}
            errorBarType="ALWAYS"
            fieldName="addressLine2"
            validationText={getFieldErrorLabel("addressLine2")}
            className="margin-bottom-2"
          />
        </div>
        <WithErrorBar
          hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressMunicipality"])}
          type="DESKTOP-ONLY"
        >
          <div className="grid-row grid-gap-1">
            <div className="grid-col-12 tablet:grid-col-6">
              <WithErrorBar hasError={doesFieldHaveError("addressMunicipality")} type="MOBILE-ONLY">
                <span className="text-bold">{Config.profileDefaults.fields.addressMunicipality.label}</span>
                <ProfileMunicipality />
              </WithErrorBar>
            </div>
            <div className="grid-col-12 tablet:grid-col-5 margin-top-2 tablet:margin-top-0">
              <WithErrorBar
                hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}
                type="MOBILE-ONLY"
              >
                <div className="grid-row grid-gap-1">
                  <div className="grid-col-2">
                    <strong>
                      <ModifiedContent>{Config.profileDefaults.fields.addressState.label}</ModifiedContent>
                    </strong>
                    <div
                      id={`question-addressState`}
                      className="text-field-width-default add-spacing-on-ele-scroll"
                    >
                      <StateDropdown
                        fieldName="addressState"
                        value={"New Jersey"}
                        validationText={Config.profileDefaults.fields.addressState.error}
                        disabled={true}
                        onSelect={(): void => {}}
                      />
                    </div>
                  </div>
                  <div className="grid-col-3">
                    <div
                      id={`question-addressZipCode`}
                      className="text-field-width-default add-spacing-on-ele-scroll"
                    >
                      <ProfileAddressTextField
                        label={Config.profileDefaults.fields.addressZipCode.label}
                        numericProps={{ maxLength: 5 }}
                        required={true}
                        errorBarType="NEVER"
                        validationText={getFieldErrorLabel("addressZipCode")}
                        fieldName={"addressZipCode"}
                      />
                    </div>
                  </div>
                </div>
              </WithErrorBar>
            </div>
          </div>
        </WithErrorBar>
        <hr aria-hidden={true} />
      </>
    </>
  );
};
