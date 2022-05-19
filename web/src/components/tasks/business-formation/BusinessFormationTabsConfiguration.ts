export const BusinessFormationTabsConfiguration = [
  { name: "Name", taxIndex: 0 },
  { name: "Business", taxIndex: 1 },
  { name: "Contacts", taxIndex: 2 },
  { name: "Review", taxIndex: 3 },
  { name: "Billing", taxIndex: 4 },
];

export const LookupBusinessFormationTabByName = (name: string): number => {
  return BusinessFormationTabsConfiguration.find((x) => x.name === name)?.taxIndex ?? 0;
};
