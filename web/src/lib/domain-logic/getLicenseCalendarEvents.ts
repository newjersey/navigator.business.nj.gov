import {
  defaultDateFormat,
  LicenseCalendarEvent,
  LicenseData,
  Licenses,
  parseDate,
} from "@businessnjgovnavigator/shared";
import { LicenseName, taskIdLicenseNameMapping } from "@businessnjgovnavigator/shared/";

export const getLicenseCalendarEvents = (
  licenseData: LicenseData | undefined,
  year: number,
  month?: number
): LicenseCalendarEvent[] => {
  const events: LicenseCalendarEvent[] = [];
  if (licenseData === undefined) {
    return events;
  }

  const isMonthDefined = month !== undefined;

  for (const [licenseName, licenseDetail] of Object.entries(licenseData.licenses as Licenses)) {
    if (licenseDetail.expirationDateISO === undefined) {
      continue;
    }

    const enabledLicenseNames = Object.values(taskIdLicenseNameMapping);

    if (!enabledLicenseNames.includes(licenseName as LicenseName)) {
      continue;
    }

    const expirationDate = parseDate(licenseDetail.expirationDateISO);
    if (expirationDate.year() === year && (isMonthDefined ? expirationDate.month() === month : true)) {
      events.push({
        dueDate: expirationDate.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
        licenseName: licenseName as LicenseName,
      });
    }
    const renewalDate = expirationDate.add(30, "days");
    if (renewalDate.year() === year && (isMonthDefined ? renewalDate.month() === month : true)) {
      events.push({
        dueDate: renewalDate.format(defaultDateFormat),
        licenseEventSubtype: "renewal",
        calendarEventType: "LICENSE",
        licenseName: licenseName as LicenseName,
      });
    }
  }
  return events;
};
