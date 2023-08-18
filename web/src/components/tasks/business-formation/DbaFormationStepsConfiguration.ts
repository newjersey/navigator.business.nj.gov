import { DbaStepNames } from "@/lib/types/types";

export const DbaFormationStepsConfiguration: {
  name: DbaStepNames;
  stepIndex: number;
  disableStepper?: boolean;
}[] = [
  { name: "Business Name", stepIndex: 0, disableStepper: true },
  { name: "DBA Resolution", stepIndex: 1 },
  { name: "Authorize Business", stepIndex: 2 }
];

export const LookupDbaStepIndexByName = (name: DbaStepNames): number | undefined => {
  return DbaFormationStepsConfiguration.find((x) => {
    return x.name === name;
  })?.stepIndex;
};

export const LookupDbaNameByStepIndex = (index: number): DbaStepNames | undefined => {
  const foundName = DbaFormationStepsConfiguration.find((x) => {
    return x.stepIndex === index;
  })?.name;
  return foundName;
};
