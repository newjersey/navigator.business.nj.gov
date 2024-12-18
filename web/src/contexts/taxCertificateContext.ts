import { emptyFormationAddressData, FormationAddress } from "@businessnjgovnavigator/shared/";
import { createContext, Dispatch, SetStateAction } from "react";

interface TaxCertificateAddressState {
  formationAddressData: FormationAddress;
}

interface FormationAddressContextType {
  state: TaxCertificateAddressState;
  setAddressData: Dispatch<SetStateAction<FormationAddress>>;
}

export const TaxCertificateContext = createContext<FormationAddressContextType>({
  state: {
    formationAddressData: emptyFormationAddressData,
  },
  setAddressData: () => {},
});
