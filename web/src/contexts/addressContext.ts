import { FormContextType } from "@/contexts/formContext";
import { ProfileFields, ReducedFieldStates } from "@/lib/types/types";
import { Address, FieldsForAddressErrorHandling, createEmptyAddress } from "@businessnjgovnavigator/shared";
import { createContext } from "react";

interface AddressState {
  addressData: Address;
  interactedFields: FieldsForAddressErrorHandling[];
  formContextState: FormContextType<ReducedFieldStates<ProfileFields, unknown>, unknown>;
}

interface AddressContextType {
  state: AddressState;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
  setFieldsInteracted: (
    fields: FieldsForAddressErrorHandling[],
    config?: { setToUninteracted: boolean }
 ) => void;
}

export const AddressContext = createContext<AddressContextType>({
  state: {
    addressData: createEmptyAddress(),
    interactedFields: [],
    formContextState: {} as FormContextType<ReducedFieldStates<ProfileFields, unknown>, unknown>,
  },
  setAddressData: () => {},
  setFieldsInteracted: () => {},
});
