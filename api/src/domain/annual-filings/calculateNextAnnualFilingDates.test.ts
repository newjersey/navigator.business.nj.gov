import * as getCurrentDateModule from "@shared/dateHelpers";
import { defaultDateFormat } from "@shared/defaultConstants";
import dayjs from "dayjs";
import { calculateNextAnnualFilingDates } from "./calculateNextAnnualFilingDates";

jest.mock("@shared/dateHelpers", () => {
  return {
    getCurrentDate: jest.fn(),
    parseDateWithFormat: jest.fn((x, y) => {
      return dayjs(x, y);
    }),
  };
});
const currentDateMock = (getCurrentDateModule as jest.Mocked<typeof getCurrentDateModule>).getCurrentDate;

describe("calculateNextAnnualFilingDates", () => {
  describe("when today is October 5, 2021", () => {
    beforeEach(() => {
      currentDateMock.mockReturnValue(dayjs("2021-10-05", defaultDateFormat));
    });

    it("finds the next 3 filing dates for an earlier-this year date", () => {
      expect(calculateNextAnnualFilingDates("2021-03-01")).toEqual([
        "2022-03-31",
        "2023-03-31",
        "2024-03-31",
      ]);
    });

    it("finds the next 3 filing dates for a date from last year", () => {
      expect(calculateNextAnnualFilingDates("2020-06-01")).toEqual([
        "2022-06-30",
        "2023-06-30",
        "2024-06-30",
      ]);
    });

    it("finds the next 3 filing dates for a much older formation date", () => {
      expect(calculateNextAnnualFilingDates("2001-04-01")).toEqual([
        "2022-04-30",
        "2023-04-30",
        "2024-04-30",
      ]);
    });

    it("finds the this 3 filing dates for a date later this year", () => {
      expect(calculateNextAnnualFilingDates("2020-11-01")).toEqual([
        "2021-11-30",
        "2022-11-30",
        "2023-11-30",
      ]);
    });

    it("finds the next 3 filing dates for a date from this month this year", () => {
      expect(calculateNextAnnualFilingDates("2021-10-01")).toEqual([
        "2022-10-31",
        "2023-10-31",
        "2024-10-31",
      ]);
    });

    it("finds the next 3 filing dates for a date from this month last year", () => {
      expect(calculateNextAnnualFilingDates("2020-10-01")).toEqual([
        "2021-10-31",
        "2022-10-31",
        "2023-10-31",
      ]);
    });

    it("finds the next 3 filing dates for a much older formation date of this month", () => {
      expect(calculateNextAnnualFilingDates("2001-10-01")).toEqual([
        "2021-10-31",
        "2022-10-31",
        "2023-10-31",
      ]);
    });

    it("finds the future 3 filing dates for a formation date in the future", () => {
      expect(calculateNextAnnualFilingDates("2030-08-29")).toEqual([
        "2031-08-31",
        "2032-08-31",
        "2033-08-31",
      ]);
    });

    it("finds the next 3 filing dates for a formation date in a later month of the same year", () => {
      expect(calculateNextAnnualFilingDates("2021-11-01")).toEqual([
        "2022-11-30",
        "2023-11-30",
        "2024-11-30",
      ]);
    });
  });

  describe("when today is October 31, 2021", () => {
    beforeEach(() => {
      currentDateMock.mockReturnValue(dayjs("2021-10-31", defaultDateFormat));
    });

    it("finds the next 3 filing dates for a date from this month this year", () => {
      expect(calculateNextAnnualFilingDates("2021-10-01")).toEqual([
        "2022-10-31",
        "2023-10-31",
        "2024-10-31",
      ]);
    });

    it("finds the next 3 filing dates for a date from this month last year", () => {
      expect(calculateNextAnnualFilingDates("2020-10-01")).toEqual([
        "2021-10-31",
        "2022-10-31",
        "2023-10-31",
      ]);
    });
  });

  describe("when today is November 1, 2021", () => {
    beforeEach(() => {
      currentDateMock.mockReturnValue(dayjs("2021-11-01", defaultDateFormat));
    });

    it("finds the next 3 filing dates for a date from this month this year", () => {
      expect(calculateNextAnnualFilingDates("2021-11-01")).toEqual([
        "2022-11-30",
        "2023-11-30",
        "2024-11-30",
      ]);
    });

    it("finds the next 3 filing dates for a date from last month last year", () => {
      expect(calculateNextAnnualFilingDates("2020-10-01")).toEqual([
        "2022-10-31",
        "2023-10-31",
        "2024-10-31",
      ]);
    });
  });
});
