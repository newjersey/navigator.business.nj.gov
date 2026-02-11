import fs from "fs";
import path from "path";
import { HousingMunicipality } from "@businessnjgovnavigator/shared/housing";

const recordsDirectory = path.join(process.cwd(), "../shared/src/static");

export const loadAllHousingMunicipalities = (): HousingMunicipality[] => {
  const fullPath = path.join(recordsDirectory, "housing-municipalities.json");

  const fileContents = fs.readFileSync(fullPath, "utf8");

  if (!fileContents) {
    throw new Error("Could not get file contents");
  }

  try {
    const records = JSON.parse(fs.readFileSync(fullPath, "utf8")) as HousingMunicipalityRecords;

    return Object.values(records).sort((a, b) => {
      return a.name > b.name ? 1 : -1;
    });
  } catch {
    throw new Error("Could not retrieve records");
  }
};

type HousingMunicipalityRecords = Record<string, HousingMunicipality>;
