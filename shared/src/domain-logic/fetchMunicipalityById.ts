import { MunicipalityDetail } from "@businessnjgovnavigator/shared/municipality";

export const fetchMunicipalityById = async (id: string): Promise<MunicipalityDetail> => {
  const file = await import(`@businessnjgovnavigator/shared/static/municipalities.json`);
  const records = file as unknown as MunicipalityRecords;
  return records[id];
};

type MunicipalityRecords = Record<string, MunicipalityDetail>;
