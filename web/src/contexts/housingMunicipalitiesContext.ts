import { HousingMunicipality } from "@businessnjgovnavigator/shared";
import { createContext } from "react";

export interface HousingMunicipalitiesContextType {
  municipalities: HousingMunicipality[];
}

export const HousingMunicipalitiesContext = createContext<HousingMunicipalitiesContextType>({
  municipalities: [],
});
