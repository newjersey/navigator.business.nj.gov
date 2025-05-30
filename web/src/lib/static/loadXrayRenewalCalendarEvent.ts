import { XrayRenewalCalendarEventType } from "@/lib/types/types";
import { convertXrayRenewalCalendarEventMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

export type XrayRenewalCalendarEventUrlSlugParam = {
  xrayRenewalCalendarEventUrlSlug: string;
};

const renewalCalendarEventsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "renewal-calendar-events",
);

export const loadXrayRenewalCalendarEvent = (): XrayRenewalCalendarEventType => {
  const fileName = "xray-renewal.md";
  const fullPath = path.join(renewalCalendarEventsDir, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const filingContent = convertXrayRenewalCalendarEventMd(fileContents, fileNameWithoutMd);
  return filingContent;
};
