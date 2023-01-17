import { isZipCodeIntl } from "@/lib/domain-logic/isZipCodeIntl";

describe("isZipCodeIntl", () => {
  it("returns true if zipcode is between 5 and 11 digits in length", () => {
    expect(isZipCodeIntl("00001")).toBe(true);
    expect(isZipCodeIntl("070010")).toBe(true);
    expect(isZipCodeIntl("0055555")).toBe(true);
    expect(isZipCodeIntl("010455000")).toBe(true);
    expect(isZipCodeIntl("01045500212")).toBe(true);
    expect(isZipCodeIntl("10455002127")).toBe(true);
  });

  it("returns false if zipcode does not have 5 digits", () => {
    expect(isZipCodeIntl("0001")).toBe(false);
    expect(isZipCodeIntl("8000")).toBe(false);
    expect(isZipCodeIntl("7001")).toBe(false);
    expect(isZipCodeIntl("999")).toBe(false);
    expect(isZipCodeIntl("1")).toBe(false);
  });

  it("returns false if zipcode contains non-numbers", () => {
    expect(isZipCodeIntl("081g9")).toBe(false);
  });
});
