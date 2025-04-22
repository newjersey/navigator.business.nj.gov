import fs from "fs";
import yaml from "js-yaml";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNetlifyConfig = (): any => {
  const cmsConfig = fs.readFileSync(
    path.join(process.cwd(), "public", "mgmt", "config.yml"),
    "utf8"
  );

  return yaml.load(cmsConfig);
};
