import SectorsJSON from "../../content/src/dashboard/sectors.json";

export interface SectorType {
  id: string;
  name: string;
}

export const LookupSectorTypeById = (id: string): SectorType => {
  return (
    arrayOfSectors.find((x) => x.id === id) ?? {
      id: "",
      name: "",
    }
  );
};

export const arrayOfSectors: SectorType[] = SectorsJSON.arrayOfSectors;
