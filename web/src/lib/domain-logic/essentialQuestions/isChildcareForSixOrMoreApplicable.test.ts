import { isChildcareForSixOrMoreApplicable } from "./isChildcareForSixOrMoreApplicable";

describe("isChildcareForSixOrMoreApplicable", () => {
  it("returns false when there is no industry", () => {
    expect(isChildcareForSixOrMoreApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isChildcareForSixOrMoreApplicable("fake-industry")).toEqual(false);
  });

  it("returns false when industry is an architecture firm", () => {
    expect(isChildcareForSixOrMoreApplicable("architecture")).toEqual(false);
  });

  it("returns true when industry provides childcare for six or more children", () => {
    expect(isChildcareForSixOrMoreApplicable("daycare")).toEqual(true);
  });

  it("returns false when industry does not fall under childcare for six or more children", () => {
    expect(isChildcareForSixOrMoreApplicable("acupuncture")).toEqual(false);
  });

  it("returns false when industry provides childcare for five or less children", () => {
    expect(isChildcareForSixOrMoreApplicable("family-daycare")).toEqual(false);
  });
});
