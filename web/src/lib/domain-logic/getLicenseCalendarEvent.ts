import { LicenseCalendarEvent } from "@/lib/types/types";
import { parseDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat, LicenseData, LookupIndustryById } from "@businessnjgovnavigator/shared/index";

export const getLicenseCalendarEvent = (
  licenseData: LicenseData | undefined,
  year: number,
  industryId: string | undefined,
  monthFilter?: number
): LicenseCalendarEvent[] => {
  if (
    licenseData === undefined ||
    licenseData.expirationISO === undefined ||
    industryId === undefined ||
    licenseData.status !== "ACTIVE"
  ) {
    return [];
  }
  const events: LicenseCalendarEvent[] = [];
  const expirationDate = parseDate(licenseData.expirationISO);
  if (expirationDate.year() === year && (monthFilter ? expirationDate.month() === monthFilter : true)) {
    events.push({
      dueDate: expirationDate.format(defaultDateFormat),
      type: "expiration",
      licenseType: LookupIndustryById(industryId).licenseType ?? "Generic",
      eventType: "licenses",
    });
  }
  const renewalDate = expirationDate.add(30, "days");

  if (renewalDate.year() === year && (monthFilter ? renewalDate.month() === monthFilter : true)) {
    events.push({
      dueDate: renewalDate.format(defaultDateFormat),
      type: "renewal",
      licenseType: LookupIndustryById(industryId).licenseType ?? "Generic",
      eventType: "licenses",
    });
  }

  return events;
};
