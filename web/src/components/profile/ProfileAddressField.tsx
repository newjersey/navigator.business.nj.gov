import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";
import {ProfileAddressTextField} from "@/components/tasks/business-formation/ProfileAddressTextField";
import {useAddressErrors} from "@/lib/data-hooks/useAddressErrors";
import { ProfileMunicipality } from "@/components/tasks/business-formation/business/ProfileMunicipality";

export const ProfileAddressField = (): ReactElement => {
  const { Config } = useConfig();
  const { setAddressData } = useContext(AddressContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();

  useMountEffect(() => {
    setAddressData((previousState) => {
      return {
        ...previousState,
        addressState: { name: "New Jersey", shortCode: "NJ" },
        addressCountry: "US",
      };
    });
  });

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
            secondaryLabel={Config.profileDefaults.general.optionalLabel}
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
