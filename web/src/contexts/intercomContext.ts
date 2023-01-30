import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import { createContext } from "react";

export interface IntercomContextType {
  setOperatingPhaseId: (operatingphaseId: OperatingPhaseId | undefined) => void;
}

export const IntercomContext = createContext<IntercomContextType>({
  setOperatingPhaseId: () => {},
});
