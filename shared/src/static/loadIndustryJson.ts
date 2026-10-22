import fs from "node:fs";
import path from "node:path";
import type { Industry } from "../industry";

const IndustryJsonPathTest = path.join(process.cwd(), "..", "content", "lib", "industry.json");

export const getIndustryJson = (): Industry[] => {
  return JSON.parse(fs.readFileSync(IndustryJsonPathTest, "utf8")).industries;
};
