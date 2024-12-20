/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericTextField } from "@/components/GenericTextField";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval } from "@/lib/utils/helpers";
import { FormationIncorporator, FormationMember, StateObject } from "@businessnjgovnavigator/shared";
import { isStartingBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

interface DisplayContent {
  modalTitle: string;
  defaultCheckbox?: string;
  modalSaveButton: string;
}

interface Props<T extends FormationMember | FormationIncorporator> {
  open: boolean;
  addressData: T[];
  displayContent: DisplayContent;
  defaultAddress?: Partial<T>;
  fieldName: string;
  setData: (addressData: T[]) => void;
  index?: number;
  handleClose: () => void;
  createEmptyAddress: () => T;
  onSave: () => void;
}

export const AddressModal = <T extends FormationMember | FormationIncorporator>(
  props: Props<T>
): ReactElement<any> => {
  const { business } = useUserData();
  const isStarting = isStartingBusiness(business);
  const { Config } = useConfig();
  const [useDefaultAddress, setUseDefaultAddress] = useState<boolean>(false);
  const [addressData, setAddressData] = useState<T>(props.createEmptyAddress());
  type ErrorState = {
    invalid: boolean | undefined;
    label: string;
  };

  const validatedFields = [
    "addressName",
    "addressLine1",
    "addressLine2",
    "addressCity",
    "addressState",
    "addressZipCode",
  ] as const;

  type ErrorFields = (typeof validatedFields)[number];
  type AddressErrorMap = Record<ErrorFields, ErrorState>;

  const createAddressErrorMap = (invalid?: boolean): AddressErrorMap => {
    return validatedFields.reduce((prev: AddressErrorMap, curr: ErrorFields) => {
      return { ...prev, [curr]: { invalid, label: "" } };
    }, {} as AddressErrorMap);
  };

  const [addressErrorMap, setAddressErrorMap] = useState<AddressErrorMap>(createAddressErrorMap());

  const getErrorStateForField = (fieldName: ErrorFields, options?: { dataOverride?: T }): ErrorState => {
    const data = options?.dataOverride ?? addressData;

    const fieldWithMaxLength = (params: {
      required: boolean;
      maxLen: number;
      labelWhenMissing: string;
      dataField: keyof T;
    }): { label: string; invalid: boolean } => {
      const exists = !!data[params.dataField];
      const isTooLong = (data[params.dataField] as string)?.length > params.maxLen;
      let label = "";
      const isValid = params.required ? exists && !isTooLong : !isTooLong;
      if (params.required && !exists) {
        label = params.labelWhenMissing;
      } else if (isTooLong) {
        label = templateEval(Config.formation.general.maximumLengthErrorText, {
          // // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field: (Config.formation.addressModal as any)[params.dataField].label,
          maxLen: params.maxLen.toString(),
        });
      }
      return { label, invalid: !isValid };
    };

    switch (fieldName) {
      case "addressLine1":
        return fieldWithMaxLength({
          required: true,
          maxLen: 35,
          labelWhenMissing: Config.formation.addressModal.addressLine1.error,
          dataField: "addressLine1",
        });
      case "addressLine2":
        return fieldWithMaxLength({
          required: false,
          maxLen: 35,
          labelWhenMissing: "",
          dataField: "addressLine2",
        });
      case "addressCity":
        return fieldWithMaxLength({
          required: true,
          maxLen: 30,
          labelWhenMissing: Config.formation.addressModal.addressCity.error,
          dataField: "addressCity",
        });
      case "addressName":
        return fieldWithMaxLength({
          required: true,
          maxLen: 50,
          labelWhenMissing: Config.formation.addressModal.name.error,
          dataField: "name",
        });
      case "addressState":
        return { invalid: !data.addressState, label: Config.formation.addressModal.addressState.error };
      case "addressZipCode":
        return {
          invalid: !data.addressZipCode || data.addressZipCode.length < 5,
          label: Config.formation.addressModal.addressZipCode.error,
        };
      default:
        return { invalid: false, label: "" };
    }
  };

  useEffect(
    function setCheckboxFalseWhenAddressChanged() {
      if (!props.defaultAddress) {
        return;
      }
      if (
        props.defaultAddress.addressLine1 !== addressData.addressLine1 ||
        props.defaultAddress.addressLine2 !== addressData.addressLine2 ||
        props.defaultAddress.addressCity !== addressData.addressCity ||
        props.defaultAddress.addressState?.shortCode !== addressData.addressState?.shortCode ||
        props.defaultAddress.addressZipCode !== addressData.addressZipCode
      ) {
        setUseDefaultAddress(false);
      }
    },
    [addressData, setUseDefaultAddress, props.defaultAddress]
  );

  useEffect(() => {
    if (props.index === undefined) {
      setAddressData(props.createEmptyAddress());
      setUseDefaultAddress(false);
      setAddressErrorMap(createAddressErrorMap());
    } else {
      setAddressData({ ...props.addressData[props.index] });
      setAddressErrorMap(createAddressErrorMap(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const checkBoxCheck = (checked: boolean): void => {
    setUseDefaultAddress(checked);
    if (checked) {
      const data = {
        ...addressData,
        ...props.defaultAddress,
      };
      setAddressData(data);

      const errorMap = validatedFields.reduce((prev: AddressErrorMap, curr: ErrorFields) => {
        return { ...prev, [curr]: getErrorStateForField(curr, { dataOverride: data }) };
      }, {} as AddressErrorMap);

      setAddressErrorMap(errorMap);
    }
  };

  const shouldBeDisabled = (field: keyof T): boolean => {
    const isCheckboxChecked = useDefaultAddress;
    const hasValue = !!addressData[field];
    return isCheckboxChecked && hasValue;
  };

  const onValidation = (fieldName: string): void => {
    setAddressErrorMap({ ...addressErrorMap, [fieldName]: getErrorStateForField(fieldName as ErrorFields) });
  };

  const onSubmit = (): void => {
    const unValidated = Object.values(addressErrorMap).some((i) => {
      return i.invalid === undefined;
    });
    if (unValidated) {
      setAddressErrorMap(
        validatedFields.reduce(
          (prev: AddressErrorMap, curr: ErrorFields) => {
            return { ...prev, [curr]: getErrorStateForField(curr) };
          },
          { ...addressErrorMap } as AddressErrorMap
        )
      );
      return;
    }

    const failedValidation = Object.values(addressErrorMap).some((i) => {
      return i.invalid;
    });

    if (failedValidation) {
      return;
    }

    if (props.index === undefined) {
      props.setData([...props.addressData, addressData]);
    } else {
      const addressObjects = [...props.addressData];
      addressObjects[props.index] = addressData;
      props.setData(addressObjects);
    }
    props.handleClose();
    props.onSave();
  };

  return (
    <ModalTwoButton
      isOpen={props.open}
      close={props.handleClose}
      title={props.displayContent.modalTitle}
      primaryButtonText={props.displayContent.modalSaveButton}
      primaryButtonOnClick={onSubmit}
      secondaryButtonText={Config.formation.general.backButtonText}
    >
      <>
        {props.defaultAddress ? (
          <FormGroup className="padding-y-1">
            <FormControlLabel
              data-testid={"default-checkbox"}
              label={props.displayContent.defaultCheckbox ?? "Use Default Address"}
              control={
                <Checkbox
                  checked={useDefaultAddress}
                  onChange={(event): void => checkBoxCheck(event.target.checked)}
                />
              }
            />
          </FormGroup>
        ) : (
          <div className={"padding-top-2"} />
        )}
        <div data-testid={`${props.fieldName}-address-modal`}>
          <WithErrorBar
            hasError={!!addressErrorMap["addressName"].invalid}
            type="ALWAYS"
            className="margin-bottom-2"
          >
            <strong>
              <ModifiedContent>{Config.formation.addressModal.name.label}</ModifiedContent>
            </strong>
            <GenericTextField
              inputWidth="full"
              value={addressData.name}
              handleChange={(value: string): void => {
                setAddressData((prevAddressData) => {
                  return { ...prevAddressData, name: value };
                });
              }}
              error={addressErrorMap["addressName"].invalid}
              onValidation={onValidation}
              validationText={addressErrorMap["addressName"].label}
              fieldName="addressName"
              required={true}
              autoComplete="name"
            />
          </WithErrorBar>
          <WithErrorBar
            hasError={!!addressErrorMap["addressLine1"].invalid}
            type="ALWAYS"
            className="margin-bottom-2"
          >
            <strong>
              <ModifiedContent>{Config.formation.addressModal.addressLine1.label}</ModifiedContent>
            </strong>
            <GenericTextField
              inputWidth="full"
              fieldName="addressLine1"
              value={addressData.addressLine1}
              handleChange={(value: string): void => {
                setAddressData((prevAddressData) => {
                  return { ...prevAddressData, addressLine1: value };
                });
              }}
              error={addressErrorMap["addressLine1"].invalid}
              onValidation={onValidation}
              autoComplete="address-line1"
              validationText={addressErrorMap["addressLine1"].label}
              disabled={shouldBeDisabled("addressLine1")}
              required={true}
            />
          </WithErrorBar>
          <WithErrorBar
            hasError={!!addressErrorMap["addressLine2"].invalid}
            type="ALWAYS"
            className="margin-bottom-2"
          >
            <strong>
              <ModifiedContent>{Config.formation.addressModal.addressLine2.label}</ModifiedContent>
            </strong>
            <span className="margin-left-1">{Config.formation.general.optionalLabel}</span>
            <GenericTextField
              inputWidth="full"
              fieldName="addressLine2"
              value={addressData.addressLine2}
              error={addressErrorMap["addressLine2"].invalid}
              validationText={addressErrorMap["addressLine2"].label}
              onValidation={onValidation}
              disabled={useDefaultAddress}
              autoComplete="address-line2"
              handleChange={(value: string): void => {
                setAddressData((prevAddressData) => {
                  return { ...prevAddressData, addressLine2: value };
                });
              }}
            />
          </WithErrorBar>
          <WithErrorBar
            hasError={
              !!addressErrorMap["addressCity"].invalid ||
              !!addressErrorMap["addressState"].invalid ||
              !!addressErrorMap["addressZipCode"].invalid
            }
            type="DESKTOP-ONLY"
          >
            <div className="grid-row grid-gap-1">
              <div className="grid-col-12 tablet:grid-col-6">
                <WithErrorBar hasError={!!addressErrorMap["addressCity"].invalid} type="MOBILE-ONLY">
                  <strong>
                    <ModifiedContent>{Config.formation.addressModal.addressCity.label}</ModifiedContent>
                  </strong>
                  <GenericTextField
                    inputWidth="full"
                    fieldName="addressCity"
                    autoComplete="address-level2"
                    value={addressData.addressCity}
                    disabled={shouldBeDisabled("addressCity")}
                    required={true}
                    handleChange={(value: string): void => {
                      setAddressData((prevAddressData) => {
                        return { ...prevAddressData, addressCity: value };
                      });
                    }}
                    error={addressErrorMap["addressCity"].invalid}
                    onValidation={onValidation}
                    validationText={addressErrorMap["addressCity"].label}
                  />
                </WithErrorBar>
              </div>
              <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
                <WithErrorBar
                  hasError={
                    !!addressErrorMap["addressState"].invalid || !!addressErrorMap["addressZipCode"].invalid
                  }
                  type="MOBILE-ONLY"
                >
                  <div className="grid-row grid-gap-1">
                    <div className="grid-col-5">
                      <strong>
                        <ModifiedContent>{Config.formation.addressModal.addressState.label}</ModifiedContent>
                      </strong>
                      <StateDropdown
                        fieldName="addressState"
                        value={addressData.addressState?.name ?? ""}
                        validationText={addressErrorMap["addressState"].label}
                        onSelect={(value: StateObject | undefined): void => {
                          setAddressData((prevAddressData) => {
                            return { ...prevAddressData, addressState: value };
                          });
                        }}
                        error={addressErrorMap["addressState"].invalid}
                        autoComplete
                        disabled={shouldBeDisabled("addressState")}
                        onValidation={onValidation}
                        required={true}
                        excludeTerritories={isStarting}
                      />
                    </div>
                    <div className="grid-col-7">
                      <strong>
                        <ModifiedContent>
                          {Config.formation.addressModal.addressZipCode.label}
                        </ModifiedContent>
                      </strong>
                      <GenericTextField
                        inputWidth="full"
                        numericProps={{
                          maxLength: 5,
                        }}
                        disabled={shouldBeDisabled("addressZipCode")}
                        fieldName={"addressZipCode"}
                        autoComplete="postal-code"
                        error={addressErrorMap["addressZipCode"].invalid}
                        handleChange={(value: string): void => {
                          setAddressData((prevAddressData) => {
                            return { ...prevAddressData, addressZipCode: value };
                          });
                        }}
                        value={addressData.addressZipCode}
                        validationText={addressErrorMap["addressZipCode"].label}
                        onValidation={onValidation}
                        required={true}
                      />
                    </div>
                  </div>
                </WithErrorBar>
              </div>
            </div>
          </WithErrorBar>
        </div>
      </>
    </ModalTwoButton>
  );
};
