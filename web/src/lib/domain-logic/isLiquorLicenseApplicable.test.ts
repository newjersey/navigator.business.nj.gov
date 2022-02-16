import { isLiquorLicenseApplicable } from "./isLiquorLicenseApplicable";

describe("isLiquorLicenseApplicable", () => {
  it("returns false when no industry is supplied", () => {
    expect(isLiquorLicenseApplicable(undefined)).toEqual(false);
  });
  it("returns false when industry does not have a liquor license option", () => {
    expect(isLiquorLicenseApplicable("auto-body-repair")).toEqual(false);
  });
  it("returns false when industry does not exist", () => {
    expect(isLiquorLicenseApplicable("fake-industry")).toEqual(false);
  });
  it("returns true when industry has a liquor license option", () => {
    expect(isLiquorLicenseApplicable("restaurant")).toEqual(true);
  });
});
