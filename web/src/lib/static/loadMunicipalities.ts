import { mapMunicipalityDetailToMunicipality } from "@/lib/utils/helpers";
import { Municipality, MunicipalityDetail } from "@businessnjgovnavigator/shared/";
import fs from "fs";
import path from "path";

const recordsDir = path.join(process.cwd(), "src/lib/static/records");

export const loadAllMunicipalities = (): Municipality[] => {
  const fullPath = path.join(recordsDir, "municipalities.json");

  const records = JSON.parse(fs.readFileSync(fullPath, "utf8")) as MunicipalityRecords;

  return Object.values(records).map(mapMunicipalityDetailToMunicipality);
};

type MunicipalityRecords = Record<string, MunicipalityDetail>;
