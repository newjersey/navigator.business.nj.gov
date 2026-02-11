import fs from "fs";
import path from "path";
import { Industry } from "@businessnjgovnavigator/shared/industry";

const IndustryJsonPathTest = path.join(process.cwd(), "..", "content", "lib", "industry.json");

export const getIndustryJson = (): Industry[] => {
  return JSON.parse(fs.readFileSync(IndustryJsonPathTest, "utf8")).industries;
};
