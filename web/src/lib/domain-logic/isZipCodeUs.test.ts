import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";

describe("isZipCodeUs", () => {
  it("returns true if zipcode in range 00501 to 99950", () => {
    expect(isZipCodeUs("00501")).toBe(true);
    expect(isZipCodeUs("99950")).toBe(true);
    expect(isZipCodeUs("07999")).toBe(true);
  });

  it("returns false if zipcode less than 00501", () => {
    expect(isZipCodeUs("00500")).toBe(false);
  });

  it("returns false if zipcode greater than 99950", () => {
    expect(isZipCodeUs("99951")).toBe(false);
  });

  it("returns false if zipcode does not have 5 digits", () => {
    expect(isZipCodeUs("1234")).toBe(false);
    expect(isZipCodeUs("8000")).toBe(false);
    expect(isZipCodeUs("7001")).toBe(false);
    expect(isZipCodeUs("999")).toBe(false);
    expect(isZipCodeUs("1")).toBe(false);
    expect(isZipCodeUs("081000")).toBe(false);
  });

  it("returns false if zipcode contains non-numbers", () => {
    expect(isZipCodeUs("081g9")).toBe(false);
  });
});
