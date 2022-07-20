import { isRealEstateAppraisalManagementApplicable } from "./isRealEstateAppraisalManagementApplicable";

describe("isRealEstateAppraisalManagementApplicable", () => {
  it("returns false when no industry is supplied", () => {
    expect(isRealEstateAppraisalManagementApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not have a real estate appraisal option", () => {
    expect(isRealEstateAppraisalManagementApplicable("auto-body-repair")).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isRealEstateAppraisalManagementApplicable("fake-industry")).toEqual(false);
  });

  it("returns true when industry has a real estate appraisal option", () => {
    expect(isRealEstateAppraisalManagementApplicable("real-estate-appraisals")).toEqual(true);
  });
});
