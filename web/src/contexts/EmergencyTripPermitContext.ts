import {
  EmergencyTripPermitApplicationInfo,
  generateEmptyEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { createContext } from "react";

interface EmergencyTripPermitState {
  stepIndex: number;
  applicationInfo: EmergencyTripPermitApplicationInfo;
}

interface EmergencyTripPermitContextType {
  state: EmergencyTripPermitState;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setApplicationInfo: React.Dispatch<React.SetStateAction<EmergencyTripPermitApplicationInfo>>;
}

export const EmergencyTripPermitContext = createContext<EmergencyTripPermitContextType>({
  state: {
    stepIndex: 0,
    applicationInfo: generateEmptyEmergencyTripPermitData(),
  },
  setStepIndex: () => {},
  setApplicationInfo: () => {},
});
