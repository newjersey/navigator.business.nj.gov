export const BusinessFormationTabsConfiguration = [
  { name: "Name", tabIndex: 0 },
  { name: "Business", tabIndex: 1 },
  { name: "Contacts", tabIndex: 2 },
  { name: "Review", tabIndex: 3 },
  { name: "Billing", tabIndex: 4 },
];

export const LookupBusinessFormationTabByName = (name: string): number => {
  return BusinessFormationTabsConfiguration.find((x) => x.name === name)?.tabIndex ?? 0;
};
