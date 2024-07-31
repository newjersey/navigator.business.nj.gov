import { defaultDateFormat, LicenseCalendarEvent, LicenseData } from "@businessnjgovnavigator/shared";
import { parseDate } from "@businessnjgovnavigator/shared/dateHelpers";

export const getLicenseCalendarEvents = (
  licenseData: LicenseData | undefined,
  year: number,
  month?: number
): LicenseCalendarEvent[] => {
  const events: LicenseCalendarEvent[] = [];
  const isMonthDefined = month !== undefined;

  if (licenseData === undefined || licenseData.expirationISO === undefined) {
    return events;
  }
  const expirationDate = parseDate(licenseData.expirationISO);
  if (expirationDate.year() === year && (isMonthDefined ? expirationDate.month() === month : true)) {
    events.push({
      dueDate: expirationDate.format(defaultDateFormat),
      licenseEventSubtype: "expiration",
      calendarEventType: "LICENSE",
    });
  }
  const renewalDate = expirationDate.add(30, "days");
  if (renewalDate.year() === year && (isMonthDefined ? renewalDate.month() === month : true)) {
    events.push({
      dueDate: renewalDate.format(defaultDateFormat),
      licenseEventSubtype: "renewal",
      calendarEventType: "LICENSE",
    });
  }

  return events;
};
