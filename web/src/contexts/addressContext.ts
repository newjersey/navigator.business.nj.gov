import {
  Address,
  createEmptyAddress, FieldsForAddressErrorHandling,
} from "@businessnjgovnavigator/shared";
import { createContext } from "react";

interface AddressState {
  addressData: Address;
  interactedFields: FieldsForAddressErrorHandling[];
}

interface AddressContextType {
  state: AddressState;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
  setFieldsInteracted: (fields: FieldsForAddressErrorHandling[], config?: { setToUninteracted: boolean }) => void;
}

export const AddressContext = createContext<AddressContextType>({
  state: {
    addressData:  createEmptyAddress(),
    interactedFields: [],
  },
  setAddressData: () => {},
  setFieldsInteracted: () => {},
});
