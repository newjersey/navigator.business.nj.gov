import { getErrorStateForAddressField } from "@/components/tasks/business-formation/getErrorStateForAddressField";
import { validatedFieldsForAddress } from "@/components/tasks/business-formation/validatedFieldsForAddress";
import { AddressContext } from "@/contexts/addressContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { AddressFields, FieldsForAddressErrorHandling } from "@businessnjgovnavigator/shared/userData";
import { useContext, useMemo } from "react";

type AddressErrorsResponse = {
  doesFieldHaveError: (field: FieldsForAddressErrorHandling) => boolean;
  doSomeFieldsHaveError: (fields: AddressFields[]) => boolean;
  getFieldErrorLabel: (field: AddressFields) => string;
};

export const useAddressErrors = (): AddressErrorsResponse => {
  const { Config } = useConfig();
  const { state } = useContext(AddressContext);

  const validatedFields = useMemo((): FieldsForAddressErrorHandling[] => {
    return validatedFieldsForAddress(state.addressData);
  }, [state.addressData]);

  const doesFieldHaveError = (field: FieldsForAddressErrorHandling): boolean => {
    if (!validatedFields.includes(field)) {
      return false;
    }

    const addressFieldErrorState = getErrorStateForAddressField({
      field,
      addressData: state.addressData,
    });
    state.formContextState.fieldStates[field].invalid =
      addressFieldErrorState.hasError && state.interactedFields.includes(field);

    state.formContextState.fieldStates[field].updated = true;
    return addressFieldErrorState.hasError;
  };

  const doSomeFieldsHaveError = (fields: AddressFields[]): boolean => {
    return fields
      .filter((field) => {
        return validatedFields.includes(field);
      })
      .some((field) => {
        if (field === "addressState") return false;
        return doesFieldHaveError(field);
      });
  };

  const getFieldErrorLabel = (field: AddressFields): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Config.profileDefaults.fields as any)[field].error;
  };

  return {
    doesFieldHaveError,
    doSomeFieldsHaveError,
    getFieldErrorLabel,
  };
};
