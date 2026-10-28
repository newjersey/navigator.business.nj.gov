import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export const getNetlifyConfig = (): any => {
  const cmsConfig = fs.readFileSync(
    path.join(process.cwd(), "public", "mgmt", "config.yml"),
    "utf8",
  );

  return yaml.load(cmsConfig);
};
