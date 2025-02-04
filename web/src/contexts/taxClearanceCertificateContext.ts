import { createContext, Dispatch, SetStateAction } from "react";
import {
  emptyTaxClearanceCertificate,
  TaxClearanceCertificate
} from "@businessnjgovnavigator/shared/taxClearanceCertificate";

export interface TaxClearanceCertificateState {
  taxClearanceCertificate: TaxClearanceCertificate
}

interface TaxClearanceCertificateContextType {
  taxClearanceCertificateState: TaxClearanceCertificateState;
    setTaxClearanceCertificateState: Dispatch<SetStateAction<TaxClearanceCertificate>>;
}

export const TaxClearanceCertificateContext = createContext<TaxClearanceCertificateContextType>({
  taxClearanceCertificateState: {
    taxClearanceCertificate: emptyTaxClearanceCertificate(),
  },
  setTaxClearanceCertificateState: () => {},
});
