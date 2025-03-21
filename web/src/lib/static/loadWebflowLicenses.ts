import { WebflowLicense } from "@/lib/types/types";
import { convertWebflowLicenseMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

const webflowLicenseDir = path.join(process.cwd(), "..", "content", "src", "webflow-licenses");

const loadWebflowLicenseByFilename = (fileName: string): WebflowLicense => {
  const fullPath = path.join(webflowLicenseDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertWebflowLicenseMd(fileContents, fileNameWithoutMd);
};

export const loadAllWebflowLicenses = (): WebflowLicense[] => {
  const fileNames = fs.readdirSync(webflowLicenseDir);
  return fileNames.map((fileName) => {
    return loadWebflowLicenseByFilename(fileName);
  });
};
