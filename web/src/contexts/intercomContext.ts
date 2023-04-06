import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import { createContext } from "react";

export interface IntercomContextType {
  setOperatingPhaseId: (operatingphaseId: OperatingPhaseId | undefined) => void;
  setLegalStructureId: (legalStructureId: string | undefined) => void;
  setIndustryId: (industryId: string | undefined) => void;
  setBusinessPersona: (businessPersona: BusinessPersona | undefined) => void;
}

export const IntercomContext = createContext<IntercomContextType>({
  setOperatingPhaseId: () => {},
  setLegalStructureId: () => {},
  setIndustryId: () => {},
  setBusinessPersona: () => {},
});
