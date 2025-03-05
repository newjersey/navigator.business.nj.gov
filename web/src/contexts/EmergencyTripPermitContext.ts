import { createContext } from "react";

interface EmergencyTripPermitState {
  stepIndex: number;
}

interface EmergencyTripPermitContextType {
  state: EmergencyTripPermitState;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const EmergencyTripPermitContext = createContext<EmergencyTripPermitContextType>({
  state: {
    stepIndex: 0,
  },
  setStepIndex: () => {},
});
