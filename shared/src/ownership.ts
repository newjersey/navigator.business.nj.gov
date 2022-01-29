export interface OwnershipType {
  id: string;
  name: string;
}

export const LookupOwnershipTypeById = (id: string): OwnershipType => {
  return (
    OwnershipTypes.find((x) => x.id === id) ?? {
      id: "",
      name: "",
    }
  );
};

export const OwnershipTypes: OwnershipType[] = [
  {
    id: "woman-owned",
    name: "a woman",
  },
  {
    id: "minority-owned",
    name: "a minority",
  },
  {
    id: "veteran-owned",
    name: "a veteran",
  },
  {
    id: "disabled-veteran",
    name: "a disabled veteran",
  },
];
