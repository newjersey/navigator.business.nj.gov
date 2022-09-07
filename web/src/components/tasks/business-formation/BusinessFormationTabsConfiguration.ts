import { FormationStepNames } from "@/lib/types/types";

export const BusinessFormationTabsConfiguration: { name: FormationStepNames; tabIndex: number }[] = [
  { name: "Name", tabIndex: 0 },
  { name: "Business", tabIndex: 1 },
  { name: "Contacts", tabIndex: 2 },
  { name: "Billing", tabIndex: 3 },
  { name: "Review", tabIndex: 4 },
];

export const LookupTabIndexByName = (name: FormationStepNames): number => {
  return BusinessFormationTabsConfiguration.find((x) => x.name === name)?.tabIndex ?? 0;
};

export const LookupNameByTabIndex = (index: number): FormationStepNames => {
  const foundName = BusinessFormationTabsConfiguration.find((x) => x.tabIndex === index)?.name;
  if (!foundName) throw "No page exists for index";
  return foundName;
};
