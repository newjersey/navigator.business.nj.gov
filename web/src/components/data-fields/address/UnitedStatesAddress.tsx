import { AddressLines1And2 } from "@/components/data-fields/address/AddressLines1And2";
import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AddressContext } from "@/contexts/addressContext";
import { DataFormErrorMap } from "@/contexts/dataFormErrorMapContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import { FormContextType } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useContext } from "react";

interface Props {
  onValidation: () => void;
  isFullWidth?: boolean;
  excludeNJ?: boolean | true;
  dataFormErrorMap?: FormContextType<DataFormErrorMap, unknown>;
  stateInputLocked?: boolean;
}

export const UnitedStatesAddress = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useAddressErrors();
  const { state, setAddressData } = useContext(AddressContext);

  const isAddressLine1Invalid =
    props.dataFormErrorMap?.fieldStates?.["addressLine1"]?.invalid ?? false;
  const isAddressCityInvalid =
    props.dataFormErrorMap?.fieldStates?.["addressCity"]?.invalid ?? false;
  const isAddressStateInvalid =
    props.dataFormErrorMap?.fieldStates?.["addressState"]?.invalid ?? false;
  const isAddressZipCodeInvalid =
    props.dataFormErrorMap?.fieldStates?.["addressZipCode"]?.invalid ?? false;

  return (
    <>
      <AddressLines1And2
        onValidation={props.onValidation}
        isFullWidth={props.isFullWidth}
        isAddressLine1Invalid={isAddressLine1Invalid}
      />
      <div className={`${props.isFullWidth ? "" : "text-field-width-default"}`}>
        <WithErrorBar
          hasError={
            doSomeFieldsHaveError(["addressCity", "addressState", "addressZipCode"]) ||
            isAddressCityInvalid ||
            isAddressStateInvalid ||
            isAddressZipCodeInvalid
          }
          type="DESKTOP-ONLY"
        >
          <div className="grid-row tablet:grid-gap-2">
            <div className="grid-col-12 tablet:grid-col-6">
              <WithErrorBar
                hasError={doesFieldHaveError("addressCity") || isAddressCityInvalid}
                type="MOBILE-ONLY"
              >
                <AddressTextField
                  label={Config.formation.fields.addressCity.label}
                  fieldName="addressCity"
                  validationText={getFieldErrorLabel("addressCity")}
                  errorBarType="ALWAYS"
                  onValidation={props.onValidation}
                  error={isAddressCityInvalid}
                />
              </WithErrorBar>
            </div>
            <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
              <WithErrorBar
                hasError={
                  doSomeFieldsHaveError(["addressState", "addressZipCode"]) ||
                  isAddressStateInvalid ||
                  isAddressZipCodeInvalid
                }
                type="MOBILE-ONLY"
              >
                <div className="grid-row grid-gap tablet:grid-gap-2">
                  <div className="grid-col-6">
                    <strong>
                      <ModifiedContent>
                        {Config.formation.fields.addressState.label}
                      </ModifiedContent>
                    </strong>
                    <ScrollableFormFieldWrapper fieldName={"addressState"}>
                      <div className="text-field-width-default">
                        <StateDropdown
                          fieldName="addressState"
                          value={state.formationAddressData.addressState?.name}
                          validationText={Config.formation.fields.addressState.error}
                          onSelect={(value: StateObject | undefined): void => {
                            setAddressData((prevAddressData) => {
                              return { ...prevAddressData, addressState: value };
                            });
                          }}
                          error={doesFieldHaveError("addressState") || isAddressStateInvalid}
                          disabled={props.stateInputLocked}
                          onValidation={props.onValidation}
                          excludeNJ={props.excludeNJ}
                        />
                      </div>
                    </ScrollableFormFieldWrapper>
                  </div>
                  <div className="grid-col-6">
                    <ScrollableFormFieldWrapper fieldName={"addressZipCode"}>
                      <div className="text-field-width-default">
                        <AddressTextField
                          label={Config.formation.fields.addressZipCode.label}
                          numericProps={{ maxLength: 5 }}
                          errorBarType="NEVER"
                          validationText={getFieldErrorLabel("addressZipCode")}
                          fieldName={"addressZipCode"}
                          onValidation={props.onValidation}
                          error={isAddressZipCodeInvalid}
                        />
                      </div>
                    </ScrollableFormFieldWrapper>
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
