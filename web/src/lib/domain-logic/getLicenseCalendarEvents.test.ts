import { getLicenseCalendarEvents } from "@/lib/domain-logic/getLicenseCalendarEvents";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import { generateLicenseData } from "@businessnjgovnavigator/shared/test";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport";
dayjs.extend(objectSupport);

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
    const tenthOfMonthDate = dayjs({ year: currentDate.year(), month: currentDate.month(), day: 10 });
    expect(
      getLicenseCalendarEvents(
        generateLicenseData({ expirationISO: tenthOfMonthDate.toISOString() }),
        currentDate.year(),
        currentDate.month()
      )
    ).toEqual([
      {
        dueDate: tenthOfMonthDate.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE"
      }
    ]);
  });

  it("returns an array containing renewal event when within the month after expiration", () => {
    const tenthOfMonthDate = dayjs({ year: currentDate.year(), month: currentDate.month(), day: 10 });
    expect(
      getLicenseCalendarEvents(
        generateLicenseData({ expirationISO: tenthOfMonthDate.toISOString() }),
        currentDate.year(),
        currentDate.add(1, "month").month()
      )
    ).toEqual([
      {
        dueDate: tenthOfMonthDate.add(30, "days").format(defaultDateFormat),
        licenseEventSubtype: "renewal",
        calendarEventType: "LICENSE"
      }
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
        calendarEventType: "LICENSE"
      },
      {
        dueDate: currentDate.add(30, "days").format(defaultDateFormat),
        licenseEventSubtype: "renewal",
        calendarEventType: "LICENSE"
      }
    ]);
  });

  it("returns an array containing only license events within the year", () => {
    const tenthOfDecemberDate = dayjs({ year: currentDate.year(), month: 11, day: 10 });
    expect(
      getLicenseCalendarEvents(
        generateLicenseData({ expirationISO: tenthOfDecemberDate.toISOString() }),
        currentDate.year()
      )
    ).toEqual([
      {
        dueDate: tenthOfDecemberDate.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE"
      }
    ]);
  });
});
