import fs from "fs";
import path from "path";
import { convertLicenseCalendarEventMd } from "@businessnjgovnavigator/shared/markdownReader";
import { LicenseEventType } from "@businessnjgovnavigator/shared/types/types";
import {
  getFileNameByUrlSlug,
  loadUrlSlugByFilename,
} from "@businessnjgovnavigator/shared/static/helpers";

type PathParameters<P> = { params: P; locale?: string };
export type LicenseCalendarEventUrlSlugParameter = {
  licenseCalendarEventUrlSlug: string;
};

const licenseCalendarEventsDirectory = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "license-calendar-events",
);

export const loadAllLicenseCalendarEvents = (): LicenseEventType[] => {
  const fileNames = fs.readdirSync(licenseCalendarEventsDirectory);
  return fileNames.map((fileName) => {
    return loadLicenseCalendarEventByFileName(fileName);
  });
};

export const loadAllLicenseCalendarEventUrlSlugs =
  (): PathParameters<LicenseCalendarEventUrlSlugParameter>[] => {
    const fileNames = fs.readdirSync(licenseCalendarEventsDirectory);
    return fileNames.flatMap((fileName) => {
      const slug = loadUrlSlugByFilename(fileName, licenseCalendarEventsDirectory);
      return ["expiration", "renewal"].map((type) => ({
        params: {
          licenseCalendarEventUrlSlug: [slug, type].join("-"),
        },
      }));
    });
  };

export const loadLicenseCalendarEventByUrlSlug = (urlSlug: string): LicenseEventType => {
  const matchingFileName = getFileNameByUrlSlug(
    licenseCalendarEventsDirectory,
    urlSlug.split("-").slice(0, -1).join("-"),
  );
  return loadLicenseCalendarEventByFileName(matchingFileName);
};

export const loadLicenseCalendarEventByFileName = (fileName: string): LicenseEventType => {
  const fullPath = path.join(licenseCalendarEventsDirectory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const filingContent = convertLicenseCalendarEventMd(fileContents, fileNameWithoutMd);
  return filingContent;
};
