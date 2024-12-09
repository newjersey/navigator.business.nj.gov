import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";

describe("isZipCodeNj", () => {
  it("returns true if zipcode in range 07001 to 08999", () => {
    expect(isZipCodeNj("07001")).toBe(true);
    expect(isZipCodeNj("08999")).toBe(true);

    expect(isZipCodeNj("07500")).toBe(true);
    expect(isZipCodeNj("07999")).toBe(true);
    expect(isZipCodeNj("08000")).toBe(true);
    expect(isZipCodeNj("08888")).toBe(true);
  });

  it("returns false if zipcode less than 07001", () => {
    expect(isZipCodeNj("07000")).toBe(false);
    expect(isZipCodeNj("06999")).toBe(false);
    expect(isZipCodeNj("00000")).toBe(false);
    expect(isZipCodeNj("01010")).toBe(false);
  });

  it("returns false if zipcode greater than 08999", () => {
    expect(isZipCodeNj("09000")).toBe(false);
    expect(isZipCodeNj("09999")).toBe(false);
    expect(isZipCodeNj("12345")).toBe(false);
    expect(isZipCodeNj("99999")).toBe(false);
  });

  it("returns false if zipcode does not have 5 digits", () => {
    expect(isZipCodeNj("1234")).toBe(false);
    expect(isZipCodeNj("123456")).toBe(false);
  });
});
