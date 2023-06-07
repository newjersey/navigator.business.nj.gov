import { MunicipalityDetail } from "@businessnjgovnavigator/shared/index";

export const fetchMunicipalityById = async (id: string): Promise<MunicipalityDetail> => {
  const file = await import(`../static/records/municipalities.json`);
  const records = file as unknown as MunicipalityRecords;
  return records[id];
};

export const fetchMunicipalityByName = async (name: string): Promise<MunicipalityDetail> => {
  const file = await import(`../static/records/municipalities.json`);
  const records = file as unknown as MunicipalityRecords;
  for (const record in records) {
    if (records[record].townName.toUpperCase() === name.toUpperCase()) {
      return records[record];
    }
  }
  return {
    id: "",
    townName: "",
    townDisplayName: "",
    townWebsite: "",
    countyId: "",
    countyName: "",
    countyClerkPhone: "",
    countyClerkWebsite: "",
    countyWebsite: "",
  };
};

type MunicipalityRecords = Record<string, MunicipalityDetail>;
