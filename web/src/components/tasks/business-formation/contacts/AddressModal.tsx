import { Content } from "@/components/Content";
import { DialogTwoButton } from "@/components/DialogTwoButton";
import { GenericTextField } from "@/components/GenericTextField";
import { StateDropdown } from "@/components/StateDropdown";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyFormationAddress, FormationAddress } from "@businessnjgovnavigator/shared/";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React, { ReactElement, useEffect, useState } from "react";

interface DisplayContent {
  title: string;
  defaultCheckbox?: string;
  saveButton: string;
}

interface Props {
  open: boolean;
  addressData: FormationAddress[];
  displayContent: DisplayContent;
  defaultAddress?: FormationAddress;
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

  const errorFields = [
    "addressName",
    "addressLine1",
    "addressCity",
    "addressState",
    "addressZipCode",
  ] as const;

  type ErrorFields = typeof errorFields[number];
  type MemberErrorMap = Record<ErrorFields, FieldStatus>;

  const createMemberErrorMap = (invalid?: boolean): MemberErrorMap =>
    errorFields.reduce(
      (prev: MemberErrorMap, curr: ErrorFields) => ({ ...prev, [curr]: { invalid } }),
      {} as MemberErrorMap
    );

  const [addressErrorMap, setMemberErrorMap] = useState<MemberErrorMap>(createMemberErrorMap());

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
      setAddressData({
        ...addressData,
        ...props.defaultAddress,
      });
      setMemberErrorMap(createMemberErrorMap(false));
    }
  };

  const onValidation = (fieldName: string, invalid: boolean) => {
    setMemberErrorMap({ ...addressErrorMap, [fieldName]: { invalid } });
  };

  const onSubmit = (): void => {
    const unValidated = Object.values(addressErrorMap).some((i) => i.invalid === undefined);
    if (unValidated) {
      setMemberErrorMap(
        errorFields.reduce(
          (prev: MemberErrorMap, curr: ErrorFields) => ({
            ...prev,
            [curr]: { invalid: prev[curr].invalid ?? true },
          }),
          { ...addressErrorMap } as MemberErrorMap
        )
      );
      return;
    }
    const failedValidation = Object.values(addressErrorMap).some((i) => i.invalid);

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
    <DialogTwoButton
      isOpen={props.open}
      close={props.handleClose}
      title={props.displayContent.title}
      primaryButtonText={props.displayContent.saveButton}
      primaryButtonOnClick={onSubmit}
      secondaryButtonText={Config.businessFormationDefaults.addressModalBackButtonText}
      dividers={true}
    >
      <>
        {props.defaultAddress ? (
          <FormGroup className="padding-left-105 padding-bottom-1">
            <FormControlLabel
              label={props.displayContent.defaultCheckbox ?? "Use Default Address"}
              control={
                <Checkbox
                  checked={useDefaultAddress}
                  onChange={(event) => checkBoxCheck(event.target.checked)}
                />
              }
            />
          </FormGroup>
        ) : (
          <div className={"padding-top-2"}></div>
        )}
        <div data-testid={`${props.fieldName}-address-modal`}>
          <Content>{Config.businessFormationDefaults.addressModalNameLabel}</Content>
          <GenericTextField
            value={addressData.name}
            placeholder={Config.businessFormationDefaults.addressModalNamePlaceholder}
            handleChange={(value: string) => setAddressData({ ...addressData, name: value })}
            error={addressErrorMap["addressName"].invalid}
            onValidation={onValidation}
            validationText={Config.businessFormationDefaults.nameErrorText}
            fieldName="addressName"
            required={true}
            autoComplete="name"
            disabled={useDefaultAddress}
          />
          <Content>{Config.businessFormationDefaults.addressModalAddressLine1Label}</Content>
          <GenericTextField
            fieldName="addressLine1"
            value={addressData.addressLine1}
            placeholder={Config.businessFormationDefaults.addressModalAddressLine1Placeholder}
            handleChange={(value: string) => setAddressData({ ...addressData, addressLine1: value })}
            error={addressErrorMap["addressLine1"].invalid}
            onValidation={onValidation}
            autoComplete="address-line1"
            validationText={Config.businessFormationDefaults.addressErrorText}
            disabled={useDefaultAddress}
            required={true}
          />
          <Content
            style={{ display: "inline" }}
            overrides={{
              p: ({ children }: { children: string[] }): ReactElement => (
                <p style={{ display: "inline" }}>{children}</p>
              ),
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
            handleChange={(value: string) => setAddressData({ ...addressData, addressLine2: value })}
          />
          <div className="grid-row grid-gap-2 margin-top-2">
            <div className="grid-col-12 tablet:grid-col-6">
              <Content>{Config.businessFormationDefaults.addressModalCityLabel}</Content>
              <GenericTextField
                fieldName="addressCity"
                autoComplete="address-level2"
                value={addressData.addressCity}
                disabled={useDefaultAddress}
                required={true}
                placeholder={Config.businessFormationDefaults.addressModalCityPlaceholder}
                handleChange={(value: string) => setAddressData({ ...addressData, addressCity: value })}
                error={addressErrorMap["addressCity"].invalid}
                onValidation={onValidation}
                validationText={Config.businessFormationDefaults.addressCityErrorText}
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
                onSelect={(value: string | undefined) =>
                  setAddressData({ ...addressData, addressState: value ?? "" })
                }
                error={addressErrorMap["addressState"].invalid}
                autoComplete="address-level1"
                disabled={useDefaultAddress}
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
                disabled={useDefaultAddress}
                fieldName={"addressZipCode"}
                autoComplete="postal-code"
                error={addressErrorMap["addressZipCode"].invalid}
                handleChange={(value: string) => setAddressData({ ...addressData, addressZipCode: value })}
                value={addressData.addressZipCode}
                validationText={Config.businessFormationDefaults.addressZipCodeErrorText}
                onValidation={onValidation}
                required={true}
                placeholder={Config.businessFormationDefaults.addressModalZipCodePlaceholder}
              />
            </div>
          </div>
        </div>
      </>
    </DialogTwoButton>
  );
};
