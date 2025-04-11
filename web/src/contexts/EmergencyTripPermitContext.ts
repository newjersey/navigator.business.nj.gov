import {
  EmergencyTripPermitApplicationInfo,
  generateNewEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { createContext, FormEvent } from "react";

interface EmergencyTripPermitState {
  stepIndex: number;
  applicationInfo: EmergencyTripPermitApplicationInfo;
}

interface EmergencyTripPermitContextType {
  state: EmergencyTripPermitState;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setApplicationInfo: React.Dispatch<React.SetStateAction<EmergencyTripPermitApplicationInfo>>;
  onSubmit?: (event?: FormEvent<HTMLFormElement>) => void;
}

export const EmergencyTripPermitContext = createContext<EmergencyTripPermitContextType>({
  state: {
    stepIndex: 0,
    applicationInfo: generateNewEmergencyTripPermitData(),
  },
  setStepIndex: () => {},
  setApplicationInfo: () => {},
  onSubmit: () => {},
});
