import { describe, expect, it } from "vitest";
import { formatUpdateDate } from "./formatUpdateDate";

describe("formatUpdateDate", () => {
  it("formats a YYYY-MM-DD date as Month D, YYYY", () => {
    expect(formatUpdateDate("2026-05-19")).toBe("May 19, 2026");
  });

  it("does not shift the day across timezones", () => {
    expect(formatUpdateDate("2026-01-01")).toBe("January 1, 2026");
    expect(formatUpdateDate("2026-12-31")).toBe("December 31, 2026");
  });

  it("returns the original string when the date cannot be parsed", () => {
    expect(formatUpdateDate("not-a-date")).toBe("not-a-date");
  });
});
