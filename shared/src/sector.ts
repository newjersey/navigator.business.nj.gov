import SectorsJSON from "../../content/src/mappings/sectors.json";

export interface SectorType {
  readonly id: string;
  readonly name: string;
}

export const LookupSectorTypeById = (id: string): SectorType => {
  return (
    arrayOfSectors.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
    }
  );
};

export const arrayOfSectors: SectorType[] = SectorsJSON.arrayOfSectors;
