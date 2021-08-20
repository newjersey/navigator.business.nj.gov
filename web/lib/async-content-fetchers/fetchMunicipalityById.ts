import { MunicipalityDetail } from "@/lib/types/types";

export const fetchMunicipalityById = async (id: string): Promise<MunicipalityDetail> => {
  const file = await import(`../static/records/municipalities.json`);
  const records = file as unknown as MunicipalityRecords;
  return records[id];
};

type MunicipalityRecords = Record<string, MunicipalityDetail>;
