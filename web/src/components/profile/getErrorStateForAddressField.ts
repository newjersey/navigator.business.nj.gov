/* eslint-disable @typescript-eslint/no-explicit-any */

import { getMergedConfig } from "@/contexts/configContext";
import { isZipCodeIntl } from "@/lib/domain-logic/isZipCodeIntl";
import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";
import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";
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
      associatedFields: [
        "addressMunicipality",
        "addressZipCode",
        "addressLine2",
        "addressCity",
        "addressProvince",
        "addressCountry",
      ],
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

  if (field === "addressState") {
    return fieldWithAssociatedFields({
      associatedFields: [
        "addressLine1",
        "addressCity",
        "addressMunicipality",
        "addressZipCode",
        "addressLine2",
      ],
      label: (Config.formation.fields as any)[field].error,
    });
  }

  if (field === "addressCity") {
    return fieldWithAssociatedFields({
      associatedFields: [
        "addressLine1",
        "addressProvince",
        "addressCountry",
        "addressZipCode",
        "addressLine2",
      ],
      label: (Config.formation.fields as any)[field].error,
    });
  }

  if (field === "addressProvince") {
    return fieldWithAssociatedFields({
      associatedFields: ["addressLine1", "addressCity", "addressCountry", "addressZipCode", "addressLine2"],
      label: (Config.formation.fields as any)[field].error,
    });
  }

  if (field === "addressCountry") {
    return fieldWithAssociatedFields({
      associatedFields: ["addressLine1", "addressCity", "addressProvince", "addressZipCode", "addressLine2"],
      label: (Config.formation.fields as any)[field].error,
    });
  }

  if (field === "addressZipCode") {
    const exists = !!addressData[field];
    // console.log("exists in addresszip", exists);
    let inRange = false;
    const isValidUsZipCode = isZipCodeUs(addressData[field]);
    const isValidNjZipCode = isZipCodeNj(addressData[field]);
    const isIntlPostalCode = isZipCodeIntl(addressData[field]);
    // console.log("isValidUsZipCode", isValidUsZipCode);
    // console.log("isValidNjZipCode", isValidNjZipCode);
    // console.log("isIntlPostalCode", isIntlPostalCode);
    // console.log("isZipCodeIntl", isZipCodeIntl("12335"));
    // console.log("isZipCodeNj 12345", isZipCodeNj("12345"));
    // console.log("isZipCodeUS 12345", isZipCodeUs("12345"));
    // console.log("isZipCodeNj 07780", isZipCodeNj("07780"));

    // const errorLabel = "";

    // console.log("input", addressData[field]);
    // console.log("isZipCodeNj input", isZipCodeNj(addressData[field]));
    // console.log("addressData", addressData);

    //inRange new
    if (addressData.addressState?.shortCode === "NJ") {
      inRange = isValidNjZipCode;
      // } else if (addressData.addressState?.shortCode && addressData[field]) {
    } else if (addressData.addressState?.shortCode) {
      inRange = isValidUsZipCode;
    } else {
      inRange = isIntlPostalCode;
    }
    // console.log("inRange", inRange);
    // console.log("country", addressData.addressCountry);
    // console.log("errorLabel", errorLabel);

    const hasError = exists && !inRange;
    // console.log("hasError", hasError);

    const zipCodeErrorLabel =
      addressData.addressState?.shortCode === "NJ"
        ? (Config.formation.fields as any)[field].error
        : (Config.formation.fields as any)[field].foreign.errorUS;

    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressLine1", "addressLine2"],
      // label: (Config.formation.fields as any)[field].error,
      label: zipCodeErrorLabel,
    });
    // inRange = isZipCodeNj(addressData[field]);
    // const hasError = exists && !inRange;

    const inRangeError = {
      ...errorState,
      hasError: hasError,
      // label: (Config.formation.fields as any)[field].error,
      label: zipCodeErrorLabel,
    };

    // console.log("inRangeError", inRangeError);

    return combineErrorStates({ firstPriority: inRangeError, secondPriority: partialAddressError });
  }
  return { ...errorState, hasError: false };
};
