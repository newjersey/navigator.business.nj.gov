import dayjs from "dayjs";
import { parseDate, parseDateWithFormat } from "./dateHelpers";

describe("dateHelpers", () => {
  describe("parseDate", () => {
    it("correctly parses the date", () => {
      const value = parseDate("2001-01-01");
      expect(value).toStrictEqual(dayjs("2001-01-01"));
    });
  });

  describe("parseDateWithFormat", () => {
    it("correctly parses the date", () => {
      const value = parseDateWithFormat("01-02-2010", "MM-DD-YYYY");
      expect(value).toStrictEqual(dayjs("2010-01-02"));
    });
  });
});
