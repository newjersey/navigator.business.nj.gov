import SectorsJSON from "@businessnjgovnavigator/content/mappings/sectors.json";

export interface SectorType {
  readonly id: string;
  readonly name: string;
  readonly nonEssentialQuestionsIds: string[];
}

export const LookupSectorTypeById = (id: string | undefined): SectorType => {
  return (
    arrayOfSectors.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
      nonEssentialQuestionsIds: [],
    }
  );
};

export const arrayOfSectors: SectorType[] = SectorsJSON.arrayOfSectors;
