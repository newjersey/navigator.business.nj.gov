import { getLicenseCalendarEvents } from "@/lib/domain-logic/getLicenseCalendarEvents";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import { generateLicenseData } from "@businessnjgovnavigator/shared/test";

describe("getLicenseCalendarEvent", () => {
  const currentDate = getCurrentDate();

  it("does not return an array containing events when licenseData is undefined", () => {
    expect(getLicenseCalendarEvents(undefined, currentDate.year(), currentDate.month())).toEqual([]);
  });

  it("does not return an array containing events when expirationISO is undefined", () => {
    expect(
      getLicenseCalendarEvents(
        generateLicenseData({ expirationISO: undefined }),
        currentDate.year(),
        currentDate.month()
      )
    ).toEqual([]);
  });

  it("returns an array containing expiration event when within the current month", () => {
    expect(
      getLicenseCalendarEvents(
        generateLicenseData({ expirationISO: currentDate.toISOString() }),
        currentDate.year(),
        currentDate.month()
      )
    ).toEqual([
      {
        dueDate: currentDate.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
      },
    ]);
  });

  it("returns an array containing renewal event when within the month after expiration", () => {
    expect(
      getLicenseCalendarEvents(
        generateLicenseData({ expirationISO: currentDate.toISOString() }),
        currentDate.year(),
        currentDate.add(1, "month").month()
      )
    ).toEqual([
      {
        dueDate: currentDate.add(30, "days").format(defaultDateFormat),
        licenseEventSubtype: "renewal",
        calendarEventType: "LICENSE",
      },
    ]);
  });

  it("returns an array containing all license events within the year", () => {
    expect(
      getLicenseCalendarEvents(
        generateLicenseData({ expirationISO: currentDate.toISOString() }),
        currentDate.year()
      )
    ).toEqual([
      {
        dueDate: currentDate.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
      },
      {
        dueDate: currentDate.add(30, "days").format(defaultDateFormat),
        licenseEventSubtype: "renewal",
        calendarEventType: "LICENSE",
      },
    ]);
  });

  it("returns an array containing only license events within the year", () => {
    const expirationDate = currentDate.month(11);
    expect(
      getLicenseCalendarEvents(
        generateLicenseData({ expirationISO: expirationDate.toISOString() }),
        expirationDate.year()
      )
    ).toEqual([
      {
        dueDate: expirationDate.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
      },
    ]);
  });
});
