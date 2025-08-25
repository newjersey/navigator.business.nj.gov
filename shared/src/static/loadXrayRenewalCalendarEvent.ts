import fs from "fs";
import path from "path";
import { convertXrayRenewalCalendarEventMd } from "../markdownReader";
import { XrayRenewalCalendarEventType } from "../types/types";

export type XrayRenewalCalendarEventUrlSlugParameter = {
  xrayRenewalCalendarEventUrlSlug: string;
};

const renewalCalendarEventsDirectory = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "renewal-calendar-events",
);

export const loadXrayRenewalCalendarEvent = (): XrayRenewalCalendarEventType => {
  const fileName = "xray-renewal.md";
  const fullPath = path.join(renewalCalendarEventsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const filingContent = convertXrayRenewalCalendarEventMd(fileContents, fileNameWithoutMd);
  return filingContent;
};
