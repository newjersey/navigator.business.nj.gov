import * as yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";

const configPath = path.join(process.cwd(), "public", "mgmt", "config.yml");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadCmsConfig = (): any => {
  return yaml.load(fs.readFileSync(configPath, "utf8"));
};
