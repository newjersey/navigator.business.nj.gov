import {
  CigaretteLicenseData,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import { createContext } from "react";

interface CigaretteLicenseContextType {
  state: CigaretteLicenseData;
  setCigaretteLicenseData: React.Dispatch<React.SetStateAction<CigaretteLicenseData>>;
}

export const CigaretteLicenseContext = createContext<CigaretteLicenseContextType>({
  state: emptyCigaretteLicenseData,
  setCigaretteLicenseData: () => {},
});

// type CigaretteLicenseFields = keyof CigaretteLicenseData;

// const taxClearanceCertificateFields = Object.keys(
//   emptyTaxClearanceCertificateData,
// ) as CigaretteLicenseFields[];

// export const taxClearanceFieldErrorMap = createReducedFieldStates(taxClearanceCertificateFields);
// export const TaxClearanceCertificateFormContext =
//   createFormContext<typeof taxClearanceFieldErrorMap>();
