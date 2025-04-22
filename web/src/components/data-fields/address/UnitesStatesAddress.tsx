import { AddressLines1And2 } from "@/components/data-fields/address/AddressLines1And2";
import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import { ReactElement, useContext } from "react";

interface Props {
  onValidation: () => void;
  isFullWidth?: boolean;
  excludeNJ?: boolean | true;
}

export const UnitesStatesAddress = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } =
    useAddressErrors();
  const { state, setAddressData } = useContext(AddressContext);

  return (
    <>
      <AddressLines1And2
        onValidation={props.onValidation}
        isFullWidth={props.isFullWidth}
      />
      <div className={`${props.isFullWidth ? "" : "text-field-width-default"}`}>
        <WithErrorBar
          hasError={doSomeFieldsHaveError([
            "addressCity",
            "addressState",
            "addressZipCode",
          ])}
          type="DESKTOP-ONLY"
        >
          <div className="grid-row tablet:grid-gap-2">
            <div className="grid-col-12 tablet:grid-col-6">
              <WithErrorBar
                hasError={doesFieldHaveError("addressCity")}
                type="MOBILE-ONLY"
              >
                <AddressTextField
                  label={Config.formation.fields.addressCity.label}
                  fieldName="addressCity"
                  validationText={getFieldErrorLabel("addressCity")}
                  errorBarType="ALWAYS"
                  onValidation={props.onValidation}
                />
              </WithErrorBar>
            </div>
            <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
              <WithErrorBar
                hasError={doSomeFieldsHaveError([
                  "addressState",
                  "addressZipCode",
                ])}
                type="MOBILE-ONLY"
              >
                <div className="grid-row grid-gap tablet:grid-gap-2">
                  <div className="grid-col-6">
                    <strong>
                      <ModifiedContent>
                        {Config.formation.fields.addressState.label}
                      </ModifiedContent>
                    </strong>
                    <div
                      id={`question-addressState`}
                      className="text-field-width-default add-spacing-on-ele-scroll"
                    >
                      <StateDropdown
                        fieldName="addressState"
                        value={state.formationAddressData.addressState?.name}
                        validationText={
                          Config.formation.fields.foreignStateOfFormation.error
                        }
                        onSelect={(value: StateObject | undefined): void => {
                          setAddressData((prevAddressData) => {
                            return { ...prevAddressData, addressState: value };
                          });
                        }}
                        error={doesFieldHaveError("addressState")}
                        disabled={false}
                        onValidation={props.onValidation}
                        excludeNJ={props.excludeNJ}
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
