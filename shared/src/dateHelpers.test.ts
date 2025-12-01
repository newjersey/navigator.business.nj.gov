import dayjs from "dayjs";
import {
  formatDate,
  formatUTCDate,
  getCurrentDateFormatted,
  getDateInCurrentYear,
  getLicenseDate,
  isDateAfterCurrentDate,
  parseDate,
  parseDateWithFormat,
} from "./dateHelpers";
import { defaultDateFormat } from "./defaultConstants";
import { randomInt } from "./intHelpers";
import { LicenseEntity } from "./license";

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
      expect(value.toJSON()).toStrictEqual(dayjs("2010-01-02").toJSON());
    });

    it("evaluates as an invalid date", () => {
      const value = parseDateWithFormat("23321", "MM-DD-YYYY");
      expect(value.isValid()).toEqual(false);
    });
  });

  describe("getCurrentDateFormatted", () => {
    it("returns the correctedly formatted date", () => {
      const value = getCurrentDateFormatted("MM-DD-YYYY");
      expect(value).toEqual(dayjs().format("MM-DD-YYYY"));
    });
  });

  describe("getLicenseDate", () => {
    let licenceData: LicenseEntity;

    beforeEach(() => {
      licenceData = {
        fullName: `some-name-${randomInt()}`,
        addressLine1: `some-address-${randomInt()}`,
        addressCity: `some-city-${randomInt()}`,
        addressState: `some-state-${randomInt()}`,
        addressCounty: `some-county-${randomInt()}`,
        addressZipCode: `some-zipcode-${randomInt()}`,
        professionName: `some-profession-${randomInt()}`,
        licenseType: `some-license-type${randomInt()}`,
        applicationNumber: `some-application-number-${randomInt()}`,
        licenseNumber: `some-license-number-${randomInt()}`,
        licenseStatus: "Active",
        issueDate: `20080404 000000.000${randomInt()}`,
        expirationDate: `20091231 000000.000${randomInt()}`,
        checklistItem: `some-item-${randomInt()}`,
        checkoffStatus: "Completed",
        dateThisStatus: `20100430 000000.000${randomInt()}`,
      };
    });

    it("returns issue date when populated", () => {
      expect(getLicenseDate(licenceData)).toEqual(
        parseDateWithFormat(licenceData.issueDate, "YYYYMMDD X"),
      );
    });

    it("returns date this status when issue date is not populated", () => {
      licenceData.issueDate = "";
      expect(getLicenseDate(licenceData)).toEqual(
        parseDateWithFormat(licenceData.dateThisStatus, "YYYYMMDD X"),
      );
    });

    it("returns expiration date when issue date is not populated", () => {
      licenceData.issueDate = "";
      licenceData.dateThisStatus = "";
      expect(getLicenseDate(licenceData)).toEqual(
        parseDateWithFormat(licenceData.expirationDate, "YYYYMMDD X"),
      );
    });
  });

  describe("getDateInCurrentYear", () => {
    it("returns the provided month and day in the current year", () => {
      const value = getDateInCurrentYear("1990-05-20");
      const currentYear = dayjs().year();
      expect(value.toJSON()).toStrictEqual(dayjs(`${currentYear}-05-20`).toJSON());
    });
  });

  describe("isDateAfterCurrentDate", () => {
    it("returns true when date is after current date", () => {
      // TODO: Fix this test
      if (dayjs().month() === 11) {
        console.log("december");
        if (dayjs().date() === 31) {
          console.log("nye");
          return;
        }
      }
      const value = dayjs().add(1, "day").format(defaultDateFormat);
      expect(isDateAfterCurrentDate(value)).toBe(true);
    });

    it("returns true when date is before current date", () => {
      const value = dayjs().subtract(1, "day").format(defaultDateFormat);
      expect(isDateAfterCurrentDate(value)).toBe(false);
    });
  });

  describe("formatDate", () => {
    it("returns empty string for falsy input", () => {
      expect(formatDate("")).toBe("");
    });

    it("returns formatted date for valid MM/YYYY input", () => {
      const input = "06/2025";
      const expected = dayjs(input).format("MM/YY");
      expect(formatDate(input)).toBe(expected);
    });

    it("returns the original string if not in MM/YYYY format", () => {
      expect(formatDate("2025/06")).toBe("2025/06");
      expect(formatDate("06-2025")).toBe("06-2025");
      expect(formatDate("invalid")).toBe("invalid");
      expect(formatDate("062025")).toBe("062025");
    });

    it("handles single-digit months incorrectly formatted (should not match)", () => {
      expect(formatDate("6/2025")).toBe("6/2025"); // Not MM/YYYY
    });

    it("returns original input for garbage date", () => {
      expect(formatDate("abc/defg")).toBe("abc/defg");
    });
  });

  describe("formatUTCDate", () => {
    it("formats valid UTC date string with default formatter", () => {
      const utcDate = "2024-01-15T10:30:00Z";
      const result = formatUTCDate(utcDate);
      expect(result).toBe("01-15-2024");
    });

    it("formats valid UTC date string with milliseconds", () => {
      const utcDate = "2024-01-15T10:30:00.123Z";
      const result = formatUTCDate(utcDate);
      expect(result).toBe("01-15-2024");
    });

    it("formats valid UTC date string with timezone offset", () => {
      const utcDate = "2024-01-15T10:30:00-04:00";
      const result = formatUTCDate(utcDate);
      expect(result).toBe("01-15-2024");
    });

    it("formats UTC date with custom formatter", () => {
      const utcDate = "2024-01-15T10:30:00Z";
      const result = formatUTCDate(utcDate, "YYYY-MM-DD");
      expect(result).toBe("2024-01-15");
    });

    it("returns empty string for empty input", () => {
      const result = formatUTCDate("");
      expect(result).toBe("");
    });

    it("returns original string for completely invalid format", () => {
      const invalidFormat = "not a date";
      const result = formatUTCDate(invalidFormat);
      expect(result).toBe("not a date");
    });
  });
});
