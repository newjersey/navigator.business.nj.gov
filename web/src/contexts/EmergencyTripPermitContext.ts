import {
  EmergencyTripPermitApplicationInfo,
  generateNewEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import React, { createContext, FormEvent } from "react";

interface EmergencyTripPermitState {
  stepIndex: number;
  applicationInfo: EmergencyTripPermitApplicationInfo;
  submitted: boolean;
}

interface EmergencyTripPermitContextType {
  state: EmergencyTripPermitState;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setApplicationInfo: React.Dispatch<React.SetStateAction<EmergencyTripPermitApplicationInfo>>;
  onSubmit?: (event?: FormEvent<HTMLFormElement>) => void;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EmergencyTripPermitContext = createContext<EmergencyTripPermitContextType>({
  state: {
    stepIndex: 0,
    applicationInfo: generateNewEmergencyTripPermitData(),
    submitted: false,
  },
  setStepIndex: () => {},
  setApplicationInfo: () => {},
  onSubmit: () => {},
  setSubmitted: () => {},
});
