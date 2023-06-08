import { parseDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat, LicenseCalendarEvent, LicenseData } from "@businessnjgovnavigator/shared/index";

export const getLicenseCalendarEvents = (
  licenseData: LicenseData | undefined,
  year: number,
  monthFilter?: number
): LicenseCalendarEvent[] => {
  const events: LicenseCalendarEvent[] = [];
  if (licenseData === undefined || licenseData.expirationISO === undefined) {
    return events;
  }
  const expirationDate = parseDate(licenseData.expirationISO);
  if (expirationDate.year() === year && (monthFilter ? expirationDate.month() === monthFilter : true)) {
    events.push({
      dueDate: expirationDate.format(defaultDateFormat),
      licenseEventSubtype: "expiration",
      calendarEventType: "LICENSE",
    });
  }
  const renewalDate = expirationDate.add(30, "days");

  if (renewalDate.year() === year && (monthFilter ? renewalDate.month() === monthFilter : true)) {
    events.push({
      dueDate: renewalDate.format(defaultDateFormat),
      licenseEventSubtype: "renewal",
      calendarEventType: "LICENSE",
    });
  }

  return events;
};
