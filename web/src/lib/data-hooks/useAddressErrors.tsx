import { getErrorStateForAddressField } from "@/components/profile/getErrorStateForAddressField";
import { AddressContext } from "@/contexts/addressContext";
import { AddressFields, FieldsForAddressErrorHandling } from "@businessnjgovnavigator/shared/types";
import { useContext } from "react";

type AddressErrorsResponse = {
  doesFieldHaveError: (field: FieldsForAddressErrorHandling) => boolean;
  doSomeFieldsHaveError: (fields: AddressFields[]) => boolean;
  getFieldErrorLabel: (field: AddressFields) => string;
  doesRequiredFieldHaveError: (field: AddressFields) => boolean;
};

export const useAddressErrors = (): AddressErrorsResponse => {
  const { state } = useContext(AddressContext);

  const validatedFields: Set<string> = new Set([
    "addressLine1",
    "addressLine2",
    "addressMunicipality",
    "addressState",
    "addressZipCode",
    "addressCity",
    "addressCountry",
    "addressProvince",
  ]);

  // use for onBlur validation
  const doesRequiredFieldHaveError = (field: FieldsForAddressErrorHandling): boolean => {
    return (
      doesFieldHaveError(field) ||
      state.formationAddressData[field] === "" ||
      state.formationAddressData[field] === undefined
    );
  };

  const doesFieldHaveError = (field: FieldsForAddressErrorHandling): boolean => {
    if (!validatedFields.has(field)) {
      return false;
    }
    const addressFieldErrorState = getErrorStateForAddressField({
      field,
      formationAddressData: state.formationAddressData,
    });
    return addressFieldErrorState.hasError;
  };

  const doSomeFieldsHaveError = (fields: AddressFields[]): boolean => {
    return fields
      .filter((field) => {
        return validatedFields.has(field);
      })
      .some((field) => {
        return doesFieldHaveError(field);
      });
  };

  const getFieldErrorLabel = (field: AddressFields): string => {
    const addressFieldErrorState = getErrorStateForAddressField({
      field,
      formationAddressData: state.formationAddressData,
    });
    return addressFieldErrorState.label;
  };

  return {
    doesFieldHaveError,
    doSomeFieldsHaveError,
    getFieldErrorLabel,
    doesRequiredFieldHaveError,
  };
};
