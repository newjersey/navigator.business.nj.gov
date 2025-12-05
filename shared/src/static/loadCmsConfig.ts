import fs from "fs";
import * as yaml from "js-yaml";
import path from "path";

const configPath = path.join(process.cwd(), "public", "mgmt", "config.yml");
const configPathTest = path.join(process.cwd(), "..", "web", "public", "mgmt", "config.yml");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadCmsConfig = (isTest: boolean = false): any => {
  let loadPath = configPath;
  if (isTest) {
    loadPath = configPathTest;
  }
  return yaml.load(fs.readFileSync(loadPath, "utf8"));
};
