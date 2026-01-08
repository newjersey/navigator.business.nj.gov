import fs from "fs";
import path from "path";
import { convertWebflowLicenseMd } from "@businessnjgovnavigator/shared/markdownReader";
import { WebflowLicense } from "@businessnjgovnavigator/shared/types/types";

const webflowLicenseDirectory = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "webflow-licenses",
);

const loadWebflowLicenseByFilename = (fileName: string): WebflowLicense => {
  const fullPath = path.join(webflowLicenseDirectory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertWebflowLicenseMd(fileContents, fileNameWithoutMd);
};

export const loadAllWebflowLicenses = (): WebflowLicense[] => {
  const fileNames = fs.readdirSync(webflowLicenseDirectory);
  return fileNames.map((fileName) => {
    return loadWebflowLicenseByFilename(fileName);
  });
};
