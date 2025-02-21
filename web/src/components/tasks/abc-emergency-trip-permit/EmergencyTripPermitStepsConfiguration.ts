import { AbcEmergencyTripPermitStepNames } from "@/lib/types/types";

export const EmergencyTripPermitStepsConfiguration: {
  name: AbcEmergencyTripPermitStepNames;
  stepIndex: number;
}[] = [
  { name: "Instructions", stepIndex: 0 },
  { name: "Requestor", stepIndex: 1 },
  { name: "Trip", stepIndex: 2 },
  { name: "Billing", stepIndex: 3 },
  { name: "Review", stepIndex: 4 },
];

export const LookupStepIndexByName = (name: AbcEmergencyTripPermitStepNames): number => {
  return (
    EmergencyTripPermitStepsConfiguration.find((x) => {
      return x.name === name;
    })?.stepIndex ?? 0
  );
};

export const LookupNameByStepIndex = (index: number): AbcEmergencyTripPermitStepNames => {
  const foundName = EmergencyTripPermitStepsConfiguration.find((x) => {
    return x.stepIndex === index;
  })?.name;
  if (!foundName) {
    throw new Error("No step exists for index");
  }
  return foundName;
};
