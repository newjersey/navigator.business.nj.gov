import { LicenseEventType } from "@/lib/types/types";
import fs from "fs";
import path from "path";
import { convertLicenseCalendarEventMd } from "../utils/markdownReader";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParams<P> = { params: P; locale?: string };
export type LicenseCalendarEventUrlSlugParam = {
  licenseCalendarEventUrlSlug: string;
};

const licenseCalendarEventsDir = path.join(process.cwd(), "..", "content", "src", "license-calendar-events");

export const loadAllLicenseCalendarEvents = (): LicenseEventType[] => {
  const fileNames = fs.readdirSync(licenseCalendarEventsDir);
  return fileNames.map((fileName) => {
    return loadLicenseCalendarEventByFileName(fileName);
  });
};

export const loadAllLicenseCalendarEventUrlSlugs = (): PathParams<LicenseCalendarEventUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(licenseCalendarEventsDir);
  return fileNames.flatMap((fileName) => {
    const slug = loadUrlSlugByFilename(fileName, licenseCalendarEventsDir);
    return ["expiration", "renewal"].map((type) => ({
      params: {
        licenseCalendarEventUrlSlug: [slug, type].join("-"),
      },
    }));
  });
};

export const loadLicenseCalendarEventByUrlSlug = (urlSlug: string): LicenseEventType => {
  const matchingFileName = getFileNameByUrlSlug(
    licenseCalendarEventsDir,
    urlSlug.split("-").slice(0, -1).join("-")
  );
  return loadLicenseCalendarEventByFileName(matchingFileName);
};

export const loadLicenseCalendarEventByFileName = (fileName: string): LicenseEventType => {
  const fullPath = path.join(licenseCalendarEventsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const filingContent = convertLicenseCalendarEventMd(fileContents, fileNameWithoutMd);
  return filingContent;
};
