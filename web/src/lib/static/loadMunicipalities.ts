import { Municipality, MunicipalityDetail } from "@businessnjgovnavigator/shared/";
import fs from "fs";
import path from "path";

const recordsDir = path.join(process.cwd(), "src/lib/static/records");

export const loadAllMunicipalities = async (): Promise<Municipality[]> => {
  const fullPath = path.join(recordsDir, "municipalities.json");

  const records = JSON.parse(fs.readFileSync(fullPath, "utf8")) as MunicipalityRecords;

  return Object.values(records).map((municipality) => ({
    displayName: municipality.townDisplayName,
    id: municipality.id,
    name: municipality.townName,
    county: municipality.countyName,
  }));
};

type MunicipalityRecords = Record<string, MunicipalityDetail>;
