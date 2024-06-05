/* eslint-disable @typescript-eslint/no-explicit-any */

import { getMergedConfig } from "@/contexts/configContext";
import { isZipCodeIntl } from "@/lib/domain-logic/isZipCodeIntl";
import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";
import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";
import { AddressFieldErrorState } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { Address, AddressFields, FieldsForAddressErrorHandling } from "@businessnjgovnavigator/shared";

export const getErrorStateForAddressField = (inputParams: {
  field: FieldsForAddressErrorHandling;
  addressData: Address;
}): AddressFieldErrorState => {
  const Config = getMergedConfig();
  const { field, addressData } = inputParams;

  const errorState = {
    field: field,
    label: (Config.profileDefaults.fields as any)[field].label,
  };

  const fieldWithMaxLength = (params: { required: boolean; maxLen: number }): AddressFieldErrorState => {
    const exists = !!addressData[field];
    const isTooLong = (addressData[field] as string)?.length > params.maxLen;
    let label = errorState.label;
    const isValid = params.required ? exists && !isTooLong : !isTooLong;
    if (params.required && !exists) {
      label = (Config.profileDefaults.fields as any)[field].error;
    } else if (isTooLong) {
      label = templateEval(Config.profileDefaults.fields.general.maximumLengthErrorText, {
        field: (Config.profileDefaults.fields as any)[field].label,
        maxLen: params.maxLen.toString(),
      });
    }
    return { ...errorState, label, hasError: !isValid };
  };

  const fieldWithAssociatedFields = (params: {
    associatedFields: AddressFields[];
    label: string;
  }): AddressFieldErrorState => {
    const exists = !!addressData[field];
    const anAssociatedFieldExists = params.associatedFields.some((it) => !!addressData[it]);

    let label = errorState.label;
    let isValid = true;

    if (!exists && anAssociatedFieldExists) {
      label = params.label;
      isValid = false;
    }

    return { ...errorState, label, hasError: !isValid };
  };

  const combineErrorStates = (params: {
    firstPriority: AddressFieldErrorState;
    secondPriority: AddressFieldErrorState;
  }): AddressFieldErrorState => {
    let finalState: AddressFieldErrorState = { ...errorState, hasError: false };

    if (params.secondPriority.hasError) {
      finalState = params.secondPriority;
    }

    if (params.firstPriority.hasError) {
      finalState = params.firstPriority;
    }

    return finalState;
  };

  const isForeignUser = (): boolean => {
    return addressData.businessLocationType !== "NJ";
  };

  if (field === "addressLine1") {
    if (isForeignUser() && addressData.businessLocationType !== undefined) {
      return fieldWithMaxLength({ required: true, maxLen: 35 });
    }

    const maxLengthError = fieldWithMaxLength({ required: false, maxLen: 35 });
    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressZipCode"],
      label: Config.profileDefaults.fields.general.partialAddressErrorText,
    });

    return combineErrorStates({ firstPriority: maxLengthError, secondPriority: partialAddressError });
  }

  if (field === "addressLine2") {
    return fieldWithMaxLength({ required: false, maxLen: 35 });
  }

  if (field === "addressCity") {
    return fieldWithMaxLength({ required: true, maxLen: 30 });
  }

  if (field === "addressMunicipality") {
    return fieldWithAssociatedFields({
      associatedFields: ["addressLine1", "addressZipCode"],
      label: Config.profileDefaults.fields.general.partialAddressErrorText,
    });
  }

  if (field === "addressProvince") {
    return fieldWithMaxLength({ required: true, maxLen: 30 });
  }

  if (field === "addressZipCode") {
    const exists = !!addressData[field];
    let inRange = false;

    if (isForeignUser() && addressData.businessLocationType !== undefined) {
      switch (addressData.businessLocationType) {
        case "US":
          inRange = isZipCodeUs(addressData[field]);
          break;
        case "INTL":
          inRange = isZipCodeIntl(addressData[field]);
          break;
      }
      const isValid = exists && inRange;
      return { ...errorState, hasError: !isValid, label: Config.profileDefaults.fields.addressZipCode.error };
    }

    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressLine1"],
      label: Config.profileDefaults.fields.general.partialAddressErrorText,
    });
    inRange = isZipCodeNj(addressData[field]);
    const hasError = exists && !inRange;
    const inRangeError = {
      ...errorState,
      hasError: hasError,
      label: Config.profileDefaults.fields.addressZipCode.error,
    };
    return combineErrorStates({ firstPriority: inRangeError, secondPriority: partialAddressError });
  }

  return { ...errorState, hasError: false };
};
