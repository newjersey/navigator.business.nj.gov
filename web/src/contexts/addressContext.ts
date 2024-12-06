import { emptyFormationAddressData, FormationAddress } from "@businessnjgovnavigator/shared/";
import { createContext, Dispatch, SetStateAction } from "react";

interface AddressState {
  formationAddressData: FormationAddress;
}

interface FormationAddressContextType {
  state: AddressState;
  setAddressData: Dispatch<SetStateAction<FormationAddress>>;
}

export const AddressContext = createContext<FormationAddressContextType>({
  state: {
    formationAddressData: emptyFormationAddressData,
  },
  setAddressData: () => {},
});
