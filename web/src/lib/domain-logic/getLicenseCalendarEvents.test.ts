import { getLicenseCalendarEvents } from "@/lib/domain-logic/getLicenseCalendarEvents";
import {
  generateLicenseDetails,
  randomElementFromArray,
  taskIdLicenseNameMapping,
} from "@businessnjgovnavigator/shared/";
import { getCurrentDate, getJanOfYear } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import { generateLicenseData } from "@businessnjgovnavigator/shared/test";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport";

dayjs.extend(objectSupport);

describe("getLicenseCalendarEvent", () => {
  const currentDate = getCurrentDate();
  const dateInJanurary = getJanOfYear(currentDate);
  const licenseNames = Object.values(taskIdLicenseNameMapping);

  it("returns empty array when licenseData is undefined", () => {
    expect(getLicenseCalendarEvents(undefined, currentDate.year(), currentDate.month())).toEqual([]);
  });

  it("returns empty array when expirationISO is undefined", () => {
    const licenseData = generateLicenseData({
      licenses: {
        [Object.values(taskIdLicenseNameMapping)[0]]: generateLicenseDetails({
          expirationDateISO: undefined,
        }),
        [Object.values(taskIdLicenseNameMapping)[1]]: generateLicenseDetails({
          expirationDateISO: undefined,
        }),
        [randomElementFromArray(Object.values(taskIdLicenseNameMapping))]: generateLicenseDetails({
          expirationDateISO: undefined,
        }),
      },
    });

    expect(getLicenseCalendarEvents(licenseData, currentDate.year())).toEqual([]);
  });

  it("returns an array containing expiration and renewal events that are within current year when month parameter is not provided", () => {
    const dateInMarch = dayjs({ year: dateInJanurary.year(), month: 2, day: 10 });
    const dateInNovember = dayjs({ year: dateInJanurary.year(), month: 10, day: 10 });
    const dateInDecember = dayjs({ year: dateInJanurary.year(), month: 11, day: 10 });

    const dateInJanNextYear = dayjs({ year: dateInJanurary.year() + 1, month: 0, day: 10 });

    const licenseData = generateLicenseData({
      licenses: {
        [licenseNames[0]]: generateLicenseDetails({
          expirationDateISO: dateInMarch.toISOString(),
        }),
        [licenseNames[1]]: generateLicenseDetails({
          expirationDateISO: dateInNovember.toISOString(),
        }),
        [licenseNames[2]]: generateLicenseDetails({
          expirationDateISO: dateInDecember.toISOString(),
        }),
        [licenseNames[3]]: generateLicenseDetails({
          expirationDateISO: dateInJanNextYear.toISOString(),
        }),
      },
    });

    expect(getLicenseCalendarEvents(licenseData, currentDate.year())).toEqual([
      {
        dueDate: dateInMarch.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
        licenseName: licenseNames[0],
      },
      {
        dueDate: dateInMarch.add(30, "days").format(defaultDateFormat),
        licenseEventSubtype: "renewal",
        calendarEventType: "LICENSE",
        licenseName: licenseNames[0],
      },
      {
        dueDate: dateInNovember.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
        licenseName: licenseNames[1],
      },
      {
        dueDate: dateInNovember.add(30, "days").format(defaultDateFormat),
        licenseEventSubtype: "renewal",
        calendarEventType: "LICENSE",
        licenseName: licenseNames[1],
      },
      {
        dueDate: dateInDecember.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
        licenseName: licenseNames[2],
      },
    ]);
  });

  it("returns an array containing expiration events that are within the month when month parameter is provided", () => {
    const firstDayOfYear = dayjs({ year: dateInJanurary.year(), month: 0, day: 1 });
    const dateInJanuary = dayjs({ year: dateInJanurary.year(), month: 0, day: 10 });
    const dateInFebuary = dayjs({ year: dateInJanurary.year(), month: 1, day: 10 });

    const licenseData = generateLicenseData({
      licenses: {
        [licenseNames[0]]: generateLicenseDetails({
          expirationDateISO: firstDayOfYear.toISOString(),
        }),
        [licenseNames[1]]: generateLicenseDetails({
          expirationDateISO: dateInJanuary.toISOString(),
        }),
        [licenseNames[2]]: generateLicenseDetails({
          expirationDateISO: dateInFebuary.toISOString(),
        }),
      },
    });

    expect(getLicenseCalendarEvents(licenseData, dateInJanurary.year(), dateInJanurary.month())).toEqual([
      {
        dueDate: firstDayOfYear.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
        licenseName: licenseNames[0],
      },
      {
        dueDate: firstDayOfYear.add(30, "days").format(defaultDateFormat),
        licenseEventSubtype: "renewal",
        calendarEventType: "LICENSE",
        licenseName: licenseNames[0],
      },
      {
        dueDate: dateInJanuary.format(defaultDateFormat),
        licenseEventSubtype: "expiration",
        calendarEventType: "LICENSE",
        licenseName: licenseNames[1],
      },
    ]);
  });
});
