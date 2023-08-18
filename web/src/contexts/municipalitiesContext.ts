import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import { createContext } from "react";

export interface MunicipalitiesContextType {
  municipalities: Municipality[];
}

export const MunicipalitiesContext = createContext<MunicipalitiesContextType>({
  municipalities: []
});
