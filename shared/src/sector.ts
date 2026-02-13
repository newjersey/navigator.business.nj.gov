import SectorsJSON from "../../content/src/mappings/sectors.json";

export interface SectorType {
  readonly id: string;
  readonly name: string;
  readonly nonEssentialQuestionsIds: string[];
}

export interface SectorIndustry {
  readonly id: string;
  readonly name: string;
  readonly naicsCodes?: string;
}

export interface EnrichedSectorType extends SectorType {
  readonly industries: SectorIndustry[];
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
