import { isZipCodeIntl } from "@/lib/domain-logic/isZipCodeIntl";

describe("isZipCodeIntl", () => {
  it("returns false if zip code is greater than 11 characters in length", () => {
    expect(isZipCodeIntl("104550021278")).toBe(false);
  });

  it("returns false if zip code does not have 1 character", () => {
    expect(isZipCodeIntl("1")).toBe(true);
    expect(isZipCodeIntl("")).toBe(false);
  });
});
