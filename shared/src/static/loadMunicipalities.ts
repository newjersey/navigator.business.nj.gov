import fs from "fs";
import path from "path";
import { Municipality, MunicipalityDetail } from "@businessnjgovnavigator/shared/municipality";

const recordsDirectory = path.join(process.cwd(), "../shared/src/static");

const mapMunicipalityDetailToMunicipality = (
  municipalityDetail: MunicipalityDetail,
): Municipality => {
  return {
    displayName: municipalityDetail.townDisplayName,
    id: municipalityDetail.id,
    name: municipalityDetail.townName,
    county: municipalityDetail.countyName,
  };
};

export const loadAllMunicipalities = (): Municipality[] => {
  const fullPath = path.join(recordsDirectory, "municipalities.json");

  const records = JSON.parse(fs.readFileSync(fullPath, "utf8")) as MunicipalityRecords;

  return Object.values(records).map((element) => mapMunicipalityDetailToMunicipality(element));
};

type MunicipalityRecords = Record<string, MunicipalityDetail>;
