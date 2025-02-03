import { createContext, Dispatch, SetStateAction } from "react";
import {emptyTaxClearanceCertificateData, TaxClearanceCertificate} from "../../../shared/src/taxClearanceCertificate";

export interface TaxClearanceCertificateState {
  taxClearanceCertificateData: TaxClearanceCertificate
}

interface TaxClearanceCertificateContextType {
  taxClearanceCertificateState: TaxClearanceCertificateState;
    setTaxClearanceCertificateState: Dispatch<SetStateAction<TaxClearanceCertificate>>;
}

export const TaxClearanceCertificateContext = createContext<TaxClearanceCertificateContextType>({
  taxClearanceCertificateState: {
    taxClearanceCertificateData: emptyTaxClearanceCertificateData(),
  },
  setTaxClearanceCertificateState: () => {},
});
