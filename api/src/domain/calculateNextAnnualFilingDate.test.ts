import dayjs from "dayjs";
import { calculateNextAnnualFilingDate } from "./calculateNextAnnualFilingDate";
import * as getCurrentDateModule from "./getCurrentDate";

jest.mock("./getCurrentDate", () => ({ getCurrentDate: jest.fn() }));
const currentDateMock = (getCurrentDateModule as jest.Mocked<typeof getCurrentDateModule>).getCurrentDate;

describe("calculateNextAnnualFilingDate", () => {
  describe("when today is October 5, 2021", () => {
    beforeEach(() => {
      currentDateMock.mockReturnValue(dayjs("2021-10-05", "YYYY-MM-DD"));
    });

    it("finds the next-year date for an earlier-this year date", () => {
      expect(calculateNextAnnualFilingDate("2021-03-01")).toEqual("2022-03-31");
    });

    it("finds the next-year date for a date from last year", () => {
      expect(calculateNextAnnualFilingDate("2020-06-01")).toEqual("2022-06-30");
    });

    it("finds the next-year date for a much older formation date", () => {
      expect(calculateNextAnnualFilingDate("2001-04-01")).toEqual("2022-04-30");
    });

    it("finds the this-year date for a date later this year", () => {
      expect(calculateNextAnnualFilingDate("2020-11-01")).toEqual("2021-11-30");
    });

    it("finds the next-year date for a date from this month this year", () => {
      expect(calculateNextAnnualFilingDate("2021-10-01")).toEqual("2022-10-31");
    });

    it("finds the this-year date for a date from this month last year", () => {
      expect(calculateNextAnnualFilingDate("2020-10-01")).toEqual("2021-10-31");
    });

    it("finds the this-year date for a much older formation date of this month", () => {
      expect(calculateNextAnnualFilingDate("2001-10-01")).toEqual("2021-10-31");
    });
  });

  describe("when today is October 31, 2021", () => {
    beforeEach(() => {
      currentDateMock.mockReturnValue(dayjs("2021-10-31", "YYYY-MM-DD"));
    });

    it("finds the next-year date for a date from this month this year", () => {
      expect(calculateNextAnnualFilingDate("2021-10-01")).toEqual("2022-10-31");
    });

    it("finds the this-year date for a date from this month last year", () => {
      expect(calculateNextAnnualFilingDate("2020-10-01")).toEqual("2021-10-31");
    });
  });

  describe("when today is November 1, 2021", () => {
    beforeEach(() => {
      currentDateMock.mockReturnValue(dayjs("2021-11-01", "YYYY-MM-DD"));
    });

    it("finds the next-year date for a date from this month this year", () => {
      expect(calculateNextAnnualFilingDate("2021-11-01")).toEqual("2022-11-30");
    });

    it("finds the this-year date for a date from last month last year", () => {
      expect(calculateNextAnnualFilingDate("2020-10-01")).toEqual("2022-10-31");
    });
  });
});
