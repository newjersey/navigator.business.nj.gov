import OwnershipTypeJSON from "../../content/src/mappings/ownershipTypes.json";
export interface OwnershipType {
  id: string;
  name: string;
}

export const LookupOwnershipTypeById = (id: string): OwnershipType => {
  return (
    arrayOfOwnershipTypes.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
    }
  );
};

export const arrayOfOwnershipTypes = OwnershipTypeJSON.arrayOfOwnershipTypes;
