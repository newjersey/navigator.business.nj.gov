import { LicenseEvent } from "@/lib/types/types";
import fs from "fs";
import path from "path";
import { convertLicenseMd } from "../utils/markdownReader";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParams<P> = { params: P; locale?: string };
export type LicenseUrlSlugParam = {
  licenseUrlSlug: string;
};

const licensesDir = path.join(process.cwd(), "..", "content", "src", "licenses");

export const loadAllLicenses = (): LicenseEvent[] => {
  const fileNames = fs.readdirSync(licensesDir);
  return fileNames.map((fileName) => {
    return loadLicensesByFileName(fileName);
  });
};

export const loadAllLicenseUrlSlugs = (): PathParams<LicenseUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(licensesDir);
  return fileNames.flatMap((fileName) => {
    const slug = loadUrlSlugByFilename(fileName, licensesDir);
    return ["expiration", "renewal"].map((type) => ({
      params: {
        licenseUrlSlug: [slug, type].join("-"),
      },
    }));
  });
};

export const loadLicenseByUrlSlug = (urlSlug: string): LicenseEvent => {
  const matchingFileName = getFileNameByUrlSlug(licensesDir, urlSlug.split("-").slice(0, -1).join("-"));
  return loadLicensesByFileName(matchingFileName);
};

export const loadLicensesByFileName = (fileName: string): LicenseEvent => {
  const fullPath = path.join(licensesDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const filingContent = convertLicenseMd(fileContents, fileNameWithoutMd);
  return filingContent;
};
