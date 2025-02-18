import municipalityJson from "../src/static/municipalities.json";

export type Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type MunicipalityDetail = {
  id: string;
  townName: string;
  townDisplayName: string;
  townWebsite: string;
  countyName: string;
  countyClerkPhone: string;
  countyClerkWebsite: string;
  countyWebsite: string;
};

export const LookupMunicipalityByName = (name: string | undefined): Municipality => {
  const keys = Object.keys(Municipalities);
  for (const key of keys) {
    const municipality = Municipalities[key];
    if (name === municipality.townName) {
      return {
        name: municipality.townName,
        displayName: municipality.townDisplayName,
        id: key,
        county: municipality.countyName,
      };
    }
  }
  return {
    county: "",
    displayName: "",
    id: "",
    name: "",
  };
};

export const Municipalities: Record<string, MunicipalityDetail> = municipalityJson;
