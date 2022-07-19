import { isProvidesStaffingServicesApplicable } from "./isProvidesStaffingServicesApplicable";

describe("isProvidesStaffingServicesApplicable", () => {
  it("returns false when no industry is supplied", () => {
    expect(isProvidesStaffingServicesApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not have a certified interior designer option", () => {
    expect(isProvidesStaffingServicesApplicable("auto-body-repair")).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isProvidesStaffingServicesApplicable("fake-industry")).toEqual(false);
  });

  it("returns true when industry has a certified interior designer option", () => {
    expect(isProvidesStaffingServicesApplicable("it-consultant")).toEqual(true);
  });
});
