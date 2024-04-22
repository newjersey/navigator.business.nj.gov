import { HousingMunicipality } from "@businessnjgovnavigator/shared/housing";
import { createContext } from "react";

export interface HousingMunicipalitiesContextType {
  municipalities: HousingMunicipality[];
}

export const HousingMunicipalitiesContext = createContext<HousingMunicipalitiesContextType>({
  municipalities: [],
});
