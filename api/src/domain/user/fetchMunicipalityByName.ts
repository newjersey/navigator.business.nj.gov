import { MunicipalityDetail } from "@shared/municipality";
export const fetchMunicipalityByName = async (name: string): Promise<MunicipalityDetail | undefined> => {
  let file;
  try {
    file = await import("@shared/static/municipalities.json");
  } catch {
    return undefined;
  }
  const records = file as unknown as MunicipalityRecords;
  for (const record in records) {
    if (records[record].townName && records[record].townName.toUpperCase() === name.toUpperCase()) {
      return records[record];
    }
  }
};

type MunicipalityRecords = Record<string, MunicipalityDetail>;
