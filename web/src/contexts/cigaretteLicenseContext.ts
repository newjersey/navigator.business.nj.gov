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
