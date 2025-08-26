import {
  CigaretteLicenseData,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import { createContext } from "react";

interface CigaretteLicenseContextType {
  state: CigaretteLicenseData;
  setCigaretteLicenseData: React.Dispatch<React.SetStateAction<CigaretteLicenseData>>;
  saveCigaretteLicenseData: () => void;
}

export const CigaretteLicenseContext = createContext<CigaretteLicenseContextType>({
  state: emptyCigaretteLicenseData,
  setCigaretteLicenseData: () => {},
  saveCigaretteLicenseData: () => {},
});
