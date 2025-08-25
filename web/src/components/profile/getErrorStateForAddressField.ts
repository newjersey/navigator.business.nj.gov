/* eslint-disable @typescript-eslint/no-explicit-any */

import { isZipCodeIntl } from "@/lib/domain-logic/isZipCodeIntl";
import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";
import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";
import {
  BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
  BUSINESS_ADDRESS_LINE_2_MAX_CHAR,
} from "@/lib/utils/formation-helpers";
import { templateEval } from "@/lib/utils/helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { FormationAddress } from "@businessnjgovnavigator/shared/index";
import {
  AddressFieldErrorState,
  AddressFields,
  FieldsForAddressErrorHandling,
} from "@businessnjgovnavigator/shared/types";

export const getErrorStateForAddressField = ({
  field,
  formationAddressData,
}: {
  field: FieldsForAddressErrorHandling;
  formationAddressData: FormationAddress;
}): AddressFieldErrorState => {
  const Config = getMergedConfig();
  const errorState = {
    field: field,
    label:
      field === "addressZipCode" && formationAddressData.addressState?.shortCode !== "NJ"
        ? (Config.formation.fields as any)[field].foreign.errorUS
        : (Config.formation.fields as any)[field].error,
  };

  const fieldWithMaxLength = (params: {
    required: boolean;
    maxLen: number;
  }): AddressFieldErrorState => {
    const exists = !!formationAddressData[field];
    const isTooLong = (formationAddressData[field] as string)?.length > params.maxLen;
    let label = errorState.label;
    const isValid = params.required ? exists && !isTooLong : !isTooLong;
    if (isTooLong) {
      label = templateEval(Config.formation.general.maximumLengthErrorText, {
        field: (Config.formation.fields as any)[field].label,
        maxLen: params.maxLen.toString(),
      });
    }
    return { ...errorState, label, hasError: !isValid };
  };

  const fieldWithAssociatedFields = (params: {
    associatedFields: AddressFields[];
  }): AddressFieldErrorState => {
    const exists = !!formationAddressData[field];
    const anAssociatedFieldExists = params.associatedFields.some(
      (it) => !!formationAddressData[it],
    );

    const label = errorState.label;
    let isValid = true;

    if (!exists && anAssociatedFieldExists) {
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
    const maxLengthError = fieldWithMaxLength({
      required: false,
      maxLen: BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
    });

    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: [
        "addressMunicipality",
        "addressZipCode",
        "addressLine2",
        "addressCity",
        "addressProvince",
        "addressCountry",
      ],
    });

    return combineErrorStates({
      firstPriority: maxLengthError,
      secondPriority: partialAddressError,
    });
  }

  if (field === "addressLine2") {
    return fieldWithMaxLength({ required: false, maxLen: BUSINESS_ADDRESS_LINE_2_MAX_CHAR });
  }

  if (field === "addressMunicipality") {
    return fieldWithAssociatedFields({
      associatedFields: ["addressLine1", "addressZipCode", "addressLine2"],
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
    });
  }

  if (field === "addressProvince") {
    return fieldWithAssociatedFields({
      associatedFields: [
        "addressLine1",
        "addressCity",
        "addressCountry",
        "addressZipCode",
        "addressLine2",
      ],
    });
  }

  if (field === "addressCountry") {
    return fieldWithAssociatedFields({
      associatedFields: [
        "addressLine1",
        "addressCity",
        "addressProvince",
        "addressZipCode",
        "addressLine2",
      ],
    });
  }

  if (field === "addressZipCode") {
    const exists = !!formationAddressData[field];
    let inRange = false;
    const isValidUsZipCode = isZipCodeUs(formationAddressData[field]);
    const isValidNjZipCode = isZipCodeNj(formationAddressData[field]);
    const isIntlPostalCode = isZipCodeIntl(formationAddressData[field]);

    if (formationAddressData.addressState?.shortCode === "NJ") {
      inRange = isValidNjZipCode;
    } else if (formationAddressData.addressState?.shortCode) {
      inRange = isValidUsZipCode;
    } else {
      inRange = isIntlPostalCode;
    }

    const hasError = exists && !inRange;

    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressLine1", "addressLine2"],
    });

    const inRangeError = {
      ...errorState,
      hasError: hasError,
    };

    return combineErrorStates({ firstPriority: inRangeError, secondPriority: partialAddressError });
  }
  return { ...errorState, hasError: false };
};
