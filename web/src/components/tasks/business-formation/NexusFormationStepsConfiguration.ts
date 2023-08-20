import { DbaStepNames } from "@/lib/types/types";

export const NexusFormationStepsConfiguration: {
  name: DbaStepNames;
  stepIndex: number;
  disableStepper?: boolean;
}[] = [
  { name: "Business Name", stepIndex: 0, disableStepper: true },
  { name: "Authorize Business", stepIndex: 1 },
];

export const LookupNexusStepIndexByName = (name: DbaStepNames): number | undefined => {
  return NexusFormationStepsConfiguration.find((x) => {
    return x.name === name;
  })?.stepIndex;
};

export const LookupNexusNameByStepIndex = (index: number): DbaStepNames | undefined => {
  const foundName = NexusFormationStepsConfiguration.find((x) => {
    return x.stepIndex === index;
  })?.name;
  return foundName;
};
