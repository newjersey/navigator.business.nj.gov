import { FormationStepNames } from "@businessnjgovnavigator/shared/types";

export const BusinessFormationStepsConfiguration: {
  name: FormationStepNames;
  stepIndex: number;
}[] = [
  { name: "Business", stepIndex: 0 },
  { name: "Contacts", stepIndex: 1 },
  { name: "Billing", stepIndex: 2 },
  { name: "Review", stepIndex: 3 },
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
