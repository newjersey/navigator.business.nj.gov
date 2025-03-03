import { AddressLines1And2 } from "@/components/data-fields/address/AddressLines1And2";
import { AddressMunicipalityDropdown } from "@/components/data-fields/address/AddressMunicipalityDropdown";
import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  onValidation: () => void;
}

export const NewJerseyAddress = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();

  return (
    <>
      <AddressLines1And2 onValidation={props.onValidation} />
      <div className="text-field-width-default">
        <WithErrorBar
          hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressMunicipality"])}
          type="DESKTOP-ONLY"
        >
          <div className="grid-row tablet:grid-gap-2">
            <div className="grid-col-12 tablet:grid-col-6">
              <WithErrorBar hasError={doesFieldHaveError("addressMunicipality")} type="MOBILE-ONLY">
                <span className="text-bold">{Config.formation.fields.addressCity.label}</span>
                <AddressMunicipalityDropdown onValidation={props.onValidation} />
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
                        onValidation={props.onValidation}
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
};
