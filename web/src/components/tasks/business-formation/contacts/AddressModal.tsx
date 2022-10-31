import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { StateDropdown } from "@/components/StateDropdown";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyFormationAddress, FormationAddress } from "@businessnjgovnavigator/shared/";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

interface DisplayContent {
  title: string;
  defaultCheckbox?: string;
  saveButton: string;
}

interface Props {
  open: boolean;
  addressData: FormationAddress[];
  displayContent: DisplayContent;
  defaultAddress?: Partial<FormationAddress>;
  fieldName: string;
  setData: (addressData: FormationAddress[]) => void;
  index?: number;
  handleClose: () => void;
  onSave: () => void;
}

export const AddressModal = (props: Props): ReactElement => {
  const [useDefaultAddress, setUseDefaultAddress] = useState<boolean>(false);
  const [addressData, setAddressData] = useState<FormationAddress>(createEmptyFormationAddress());
  type FieldStatus = {
    invalid: boolean | undefined;
  };

  const requiredFields = [
    "addressName",
    "addressLine1",
    "addressCity",
    "addressState",
    "addressZipCode",
  ] as const;

  type ErrorFields = typeof requiredFields[number];
  type MemberErrorMap = Record<ErrorFields, FieldStatus>;

  const createMemberErrorMap = (invalid?: boolean): MemberErrorMap => {
    return requiredFields.reduce((prev: MemberErrorMap, curr: ErrorFields) => {
      return { ...prev, [curr]: { invalid } };
    }, {} as MemberErrorMap);
  };

  const [addressErrorMap, setMemberErrorMap] = useState<MemberErrorMap>(createMemberErrorMap());

  useEffect(
    function setCheckboxFalseWhenAddressChanged() {
      if (!props.defaultAddress) {
        return;
      }
      if (
        props.defaultAddress.addressLine1 !== addressData.addressLine1 ||
        props.defaultAddress.addressLine2 !== addressData.addressLine2 ||
        props.defaultAddress.addressCity !== addressData.addressCity ||
        props.defaultAddress.addressState !== addressData.addressState ||
        props.defaultAddress.addressZipCode !== addressData.addressZipCode
      ) {
        setUseDefaultAddress(false);
      }
    },
    [addressData, setUseDefaultAddress, props.defaultAddress]
  );

  useEffect(() => {
    if (props.index !== undefined) {
      setAddressData({ ...props.addressData[props.index] });
      setMemberErrorMap(createMemberErrorMap(false));
    } else {
      setAddressData(createEmptyFormationAddress());
      setUseDefaultAddress(false);
      setMemberErrorMap(createMemberErrorMap());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const checkBoxCheck = (checked: boolean) => {
    setUseDefaultAddress(checked);
    if (checked) {
      const data = {
        ...addressData,
        ...props.defaultAddress,
      };
      setAddressData(data);

      const errorMap = requiredFields.reduce((prev: MemberErrorMap, curr: ErrorFields) => {
        return {
          ...prev,
          [curr]: { invalid: !data[curr as keyof FormationAddress] },
        };
      }, {} as MemberErrorMap);

      setMemberErrorMap({
        ...errorMap,
        addressName: { invalid: data.name.trim() ? false : undefined },
      });
    }
  };

  const shouldBeDisabled = (field: keyof FormationAddress): boolean => {
    const isCheckboxChecked = useDefaultAddress;
    const hasValue = !!addressData[field];
    return isCheckboxChecked && hasValue;
  };

  const onValidation = (fieldName: string, invalid: boolean) => {
    setMemberErrorMap({ ...addressErrorMap, [fieldName]: { invalid } });
  };

  const onSubmit = (): void => {
    const unValidated = Object.values(addressErrorMap).some((i) => {
      return i.invalid === undefined;
    });
    if (unValidated) {
      setMemberErrorMap(
        requiredFields.reduce(
          (prev: MemberErrorMap, curr: ErrorFields) => {
            return {
              ...prev,
              [curr]: { invalid: prev[curr].invalid ?? true },
            };
          },
          { ...addressErrorMap } as MemberErrorMap
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
      title={props.displayContent.title}
      primaryButtonText={props.displayContent.saveButton}
      primaryButtonOnClick={onSubmit}
      secondaryButtonText={Config.businessFormationDefaults.addressModalBackButtonText}
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
                  onChange={(event) => {
                    return checkBoxCheck(event.target.checked);
                  }}
                />
              }
            />
          </FormGroup>
        ) : (
          <div className={"padding-top-2"} />
        )}
        <div data-testid={`${props.fieldName}-address-modal`}>
          <Content>{Config.businessFormationDefaults.addressModalNameLabel}</Content>
          <GenericTextField
            value={addressData.name}
            placeholder={Config.businessFormationDefaults.addressModalNamePlaceholder}
            handleChange={(value: string) => {
              return setAddressData((prevAddressData) => {
                return { ...prevAddressData, name: value };
              });
            }}
            error={addressErrorMap["addressName"].invalid}
            onValidation={onValidation}
            validationText={Config.businessFormationDefaults.nameErrorText}
            fieldName="addressName"
            required={true}
            autoComplete="name"
          />
          <Content>{Config.businessFormationDefaults.addressModalAddressLine1Label}</Content>
          <GenericTextField
            fieldName="addressLine1"
            value={addressData.addressLine1}
            placeholder={Config.businessFormationDefaults.addressModalAddressLine1Placeholder}
            handleChange={(value: string) => {
              return setAddressData((prevAddressData) => {
                return { ...prevAddressData, addressLine1: value };
              });
            }}
            error={addressErrorMap["addressLine1"].invalid}
            onValidation={onValidation}
            autoComplete="address-line1"
            validationText={Config.businessFormationDefaults.addressErrorText}
            disabled={shouldBeDisabled("addressLine1")}
            required={true}
          />
          <Content
            style={{ display: "inline" }}
            overrides={{
              p: ({ children }: { children: string[] }): ReactElement => {
                return <p style={{ display: "inline" }}>{children}</p>;
              },
            }}
          >
            {Config.businessFormationDefaults.addressModalAddressLine2Label}
          </Content>{" "}
          <div className="h6-styling">{Config.businessFormationDefaults.addressModalLine2Optional}</div>
          <GenericTextField
            fieldName="addressLine2"
            value={addressData.addressLine2}
            placeholder={Config.businessFormationDefaults.addressModalAddressLine2Placeholder}
            disabled={useDefaultAddress}
            autoComplete="address-line2"
            handleChange={(value: string) => {
              return setAddressData((prevAddressData) => {
                return { ...prevAddressData, addressLine2: value };
              });
            }}
          />
          <div className="grid-row grid-gap-2 margin-top-2">
            <div className="grid-col-12 tablet:grid-col-6">
              <Content>{Config.businessFormationDefaults.addressModalCityLabel}</Content>
              <GenericTextField
                fieldName="addressCity"
                autoComplete="address-level2"
                value={addressData.addressCity}
                disabled={shouldBeDisabled("addressCity")}
                required={true}
                placeholder={Config.businessFormationDefaults.addressModalCityPlaceholder}
                handleChange={(value: string) => {
                  return setAddressData((prevAddressData) => {
                    return { ...prevAddressData, addressCity: value };
                  });
                }}
                error={addressErrorMap["addressCity"].invalid}
                onValidation={onValidation}
                validationText={Config.businessFormationDefaults.addressModalCityErrorText}
              />
            </div>
            <div className="grid-col-6 tablet:grid-col-3">
              <div className="margin-bottom-2">
                <Content>{Config.businessFormationDefaults.addressModalStateLabel}</Content>
              </div>
              <StateDropdown
                fieldName="addressState"
                value={addressData.addressState}
                placeholder={Config.businessFormationDefaults.addressModalStatePlaceholder}
                validationText={Config.businessFormationDefaults.addressStateErrorText}
                onSelect={(value: string | undefined) => {
                  return setAddressData({ ...addressData, addressState: value ?? "" });
                }}
                error={addressErrorMap["addressState"].invalid}
                autoComplete="address-level1"
                disabled={shouldBeDisabled("addressState")}
                onValidation={onValidation}
                required={true}
              />
            </div>
            <div className="grid-col-6 tablet:grid-col-3">
              <Content>{Config.businessFormationDefaults.addressModalZipCodeLabel}</Content>
              <GenericTextField
                numericProps={{
                  maxLength: 5,
                }}
                disabled={shouldBeDisabled("addressZipCode")}
                fieldName={"addressZipCode"}
                autoComplete="postal-code"
                error={addressErrorMap["addressZipCode"].invalid}
                handleChange={(value: string) => {
                  return setAddressData((prevAddressData) => {
                    return { ...prevAddressData, addressZipCode: value };
                  });
                }}
                value={addressData.addressZipCode}
                validationText={Config.businessFormationDefaults.addressModalZipCodeErrorText}
                onValidation={onValidation}
                required={true}
                placeholder={Config.businessFormationDefaults.addressModalZipCodePlaceholder}
              />
            </div>
          </div>
        </div>
      </>
    </ModalTwoButton>
  );
};
