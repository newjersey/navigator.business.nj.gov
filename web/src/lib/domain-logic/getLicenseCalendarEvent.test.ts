import { getLicenseCalendarEvent } from "@/lib/domain-logic/getLicenseCalendarEvent";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import { generateLicenseData } from "@businessnjgovnavigator/shared/test";

describe("getLicenseCalendarEvent", () => {
  const currentDate = getCurrentDate();

  it("does not return an array containing events when licenseData is undefined", () => {
    expect(getLicenseCalendarEvent(undefined, currentDate.year(), currentDate.month())).toEqual([]);
  });

  it("does not return an array containing events when expirationISO is undefined", () => {
    expect(
      getLicenseCalendarEvent(
        generateLicenseData({ expirationISO: undefined, status: "ACTIVE" }),
        currentDate.year(),
        currentDate.month()
      )
    ).toEqual([]);
  });

  it("does not return an array containing events when license status is not Active", () => {
    expect(
      getLicenseCalendarEvent(
        generateLicenseData({ expirationISO: currentDate.toISOString(), status: "BARRED" }),
        currentDate.year(),
        currentDate.month()
      )
    ).toEqual([]);
  });

  it("returns an array containing expiration event when within the current month", () => {
    expect(
      getLicenseCalendarEvent(
        generateLicenseData({ expirationISO: currentDate.toISOString(), status: "ACTIVE" }),
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
      getLicenseCalendarEvent(
        generateLicenseData({ expirationISO: currentDate.toISOString(), status: "ACTIVE" }),
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
      getLicenseCalendarEvent(
        generateLicenseData({ expirationISO: currentDate.toISOString(), status: "ACTIVE" }),
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
      getLicenseCalendarEvent(
        generateLicenseData({ expirationISO: expirationDate.toISOString(), status: "ACTIVE" }),
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
