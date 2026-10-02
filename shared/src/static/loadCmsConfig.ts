import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const configPath = path.join(process.cwd(), "public", "mgmt", "config.yml");
const configPathTest = path.join(process.cwd(), "..", "web", "public", "mgmt", "config.yml");

export const loadCmsConfig = (isTest: boolean = false): any => {
  let loadPath = configPath;
  if (isTest) {
    loadPath = configPathTest;
  }
  return yaml.load(fs.readFileSync(loadPath, "utf8"));
};
