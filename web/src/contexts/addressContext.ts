import { Address, emptyAddressData } from "@businessnjgovnavigator/shared/";
import { Dispatch, SetStateAction, createContext } from "react";

interface AddressState {
  addressData: Address;
}

interface AddressContextType {
  state: AddressState;
  setAddressData: Dispatch<SetStateAction<Address>>;
}

export const AddressContext = createContext<AddressContextType>({
  state: {
    addressData: emptyAddressData,
  },
  setAddressData: () => {},
});
