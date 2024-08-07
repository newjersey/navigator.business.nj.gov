/* eslint-disable @typescript-eslint/no-explicit-any */

import { getMergedConfig } from "@/contexts/configContext";
import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";
import { AddressFieldErrorState, AddressFields, FieldsForAddressErrorHandling } from "@/lib/types/types";
import {
  BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
  BUSINESS_ADDRESS_LINE_2_MAX_CHAR,
} from "@/lib/utils/formation-helpers";
import { templateEval } from "@/lib/utils/helpers";
import { Address } from "@businessnjgovnavigator/shared/index";

export const getErrorStateForAddressField = ({
  field,
  addressData,
}: {
  field: FieldsForAddressErrorHandling;
  addressData: Address;
}): AddressFieldErrorState => {
  const Config = getMergedConfig();
  const errorState = {
    field: field,
    label: (Config.formation.fields as any)[field].label,
  };

  const fieldWithMaxLength = (params: { required: boolean; maxLen: number }): AddressFieldErrorState => {
    const exists = !!addressData[field];
    const isTooLong = (addressData[field] as string)?.length > params.maxLen;
    let label = errorState.label;
    const isValid = params.required ? exists && !isTooLong : !isTooLong;
    if (params.required && !exists) {
      label = (Config.formation.fields as any)[field].error;
    } else if (isTooLong) {
      label = templateEval(Config.formation.general.maximumLengthErrorText, {
        field: (Config.formation.fields as any)[field].label,
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

  if (field === "addressLine1") {
    const maxLengthError = fieldWithMaxLength({ required: false, maxLen: BUSINESS_ADDRESS_LINE_1_MAX_CHAR });

    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressZipCode", "addressLine2"],
      label: (Config.formation.fields as any)[field].error,
    });

    return combineErrorStates({ firstPriority: maxLengthError, secondPriority: partialAddressError });
  }

  if (field === "addressLine2") {
    return fieldWithMaxLength({ required: false, maxLen: BUSINESS_ADDRESS_LINE_2_MAX_CHAR });
  }

  if (field === "addressMunicipality") {
    return fieldWithAssociatedFields({
      associatedFields: ["addressLine1", "addressZipCode", "addressLine2"],
      label: (Config.formation.fields as any)[field].error,
    });
  }

  if (field === "addressZipCode") {
    const exists = !!addressData[field];
    let inRange = false;

    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressLine1", "addressLine2"],
      label: (Config.formation.fields as any)[field].error,
    });
    inRange = isZipCodeNj(addressData[field]);
    const hasError = exists && !inRange;
    const inRangeError = {
      ...errorState,
      hasError: hasError,
      label: (Config.formation.fields as any)[field].error,
    };

    return combineErrorStates({ firstPriority: inRangeError, secondPriority: partialAddressError });
  }

  return { ...errorState, hasError: false };
};
