import {
  convertIndustryToLicenseType,
  industryHasALicenseType,
} from "@domain/license-status/convertIndustryToLicenseType";

const testFn = (): void => {
  convertIndustryToLicenseType("restaurant");
};

describe("convertIndustryToLicenseType", () => {
  it("returns license type if the industry has a license type", () => {
    const result = convertIndustryToLicenseType("certified-public-accountant");
    expect(result).toBe("Accountancy");
  });

  it("throws an error if the industry does not have a license type", () => {
    expect(testFn).toThrow("restaurant does not have a license type");
  });
});

describe("industryHasALicenseType", () => {
  it("returns true if the industry has a license type", () => {
    const result = industryHasALicenseType("certified-public-accountant");
    expect(result).toBe(true);
  });

  it("returns false if the industry does not have a license type", () => {
    const result = industryHasALicenseType("restaurant");
    expect(result).toBe(false);
  });

  it("returns false if the industry does not exist", () => {
    const result = industryHasALicenseType("fake-industry");
    expect(result).toBe(false);
  });
});
