import { RenewalEventType } from "@/lib/types/types";
import fs from "fs";
import path from "path";
import { convertRenewalCalendarEventMd } from "../utils/markdownReader";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParams<P> = { params: P; locale?: string };
export type RenewalCalendarEventUrlSlugParam = {
  renewalCalendarEventUrlSlug: string;
};

const renewalCalendarEventsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "renewal-calendar-events",
);

export const loadAllRenewalCalendarEvents = (): RenewalEventType[] => {
  const fileNames = fs.readdirSync(renewalCalendarEventsDir);
  return fileNames.map((fileName) => {
    return loadRenewalCalendarEventByFileName(fileName);
  });
};

export const loadAllRenewalCalendarEventUrlSlugs =
  (): PathParams<RenewalCalendarEventUrlSlugParam>[] => {
    const fileNames = fs.readdirSync(renewalCalendarEventsDir);
    return fileNames.flatMap((fileName) => {
      const slug = loadUrlSlugByFilename(fileName, renewalCalendarEventsDir);
      return {
        params: {
          renewalCalendarEventUrlSlug: slug,
        },
      };
    });
  };

export const loadRenewalCalendarEventByUrlSlug = (urlSlug: string): RenewalEventType => {
  const matchingFileName = getFileNameByUrlSlug(renewalCalendarEventsDir, urlSlug);
  return loadRenewalCalendarEventByFileName(matchingFileName);
};

export const loadRenewalCalendarEventByFileName = (fileName: string): RenewalEventType => {
  const fullPath = path.join(renewalCalendarEventsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const filingContent = convertRenewalCalendarEventMd(fileContents, fileNameWithoutMd);
  return filingContent;
};
