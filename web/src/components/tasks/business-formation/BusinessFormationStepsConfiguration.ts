import { FormationStepNames } from "@/lib/types/types";

export const BusinessFormationStepsConfiguration: { name: FormationStepNames; stepIndex: number }[] = [
  { name: "Name", stepIndex: 0 },
  { name: "Business", stepIndex: 1 },
  { name: "Contacts", stepIndex: 2 },
  { name: "Billing", stepIndex: 3 },
  { name: "Review", stepIndex: 4 },
];

export const LookupStepIndexByName = (name: FormationStepNames): number => {
  return (
    BusinessFormationStepsConfiguration.find((x) => {
      return x.name === name;
    })?.stepIndex ?? 0
  );
};

export const LookupNameByStepIndex = (index: number): FormationStepNames => {
  const foundName = BusinessFormationStepsConfiguration.find((x) => {
    return x.stepIndex === index;
  })?.name;
  if (!foundName) {
    throw new Error("No step exists for index");
  }
  return foundName;
};
