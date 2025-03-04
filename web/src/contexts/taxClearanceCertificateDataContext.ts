import { createFormContext, createReducedFieldStates } from "@/contexts/formContext";
import {
  emptyTaxClearanceCertificateData,
  TaxClearanceCertificateData,
} from "@businessnjgovnavigator/shared";
import { createContext } from "react";

interface TaxClearanceCertificateDataContextType {
  state: TaxClearanceCertificateData;
  setTaxClearanceCertificateData: React.Dispatch<React.SetStateAction<TaxClearanceCertificateData>>;
}

export const TaxClearanceCertificateDataContext = createContext<TaxClearanceCertificateDataContextType>({
  state: emptyTaxClearanceCertificateData,
  setTaxClearanceCertificateData: () => {},
});

type TaxClearanceCertificateFields = keyof TaxClearanceCertificateData;

const taxClearanceCertificateFields = Object.keys(
  emptyTaxClearanceCertificateData
) as TaxClearanceCertificateFields[];

export const taxClearanceFieldErrorMap = createReducedFieldStates(taxClearanceCertificateFields);
export const TaxClearanceCertificateFormContext = createFormContext<typeof taxClearanceFieldErrorMap>();
