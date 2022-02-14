import OwnershipTypeJSON from "../../content/src/dashboard/ownershipTypes.json";
export interface OwnershipType {
  id: string;
  name: string;
}

export const LookupOwnershipTypeById = (id: string): OwnershipType => {
  return (
    arrayOfOwnershipTypes.find((x) => x.id === id) ?? {
      id: "",
      name: "",
    }
  );
};

export const arrayOfOwnershipTypes = OwnershipTypeJSON.arrayOfOwnershipTypes;
