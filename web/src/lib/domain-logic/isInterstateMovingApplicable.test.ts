import { isInterstateMovingApplicable } from "@/lib/domain-logic/isInterstateMovingApplicable";

describe("isInterstateMovingApplicable", () => {
  it("returns false when there is no industry", () => {
    expect(isInterstateMovingApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not fall under moving company", () => {
    expect(isInterstateMovingApplicable("acupuncture")).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isInterstateMovingApplicable("fake-industry")).toEqual(false);
  });

  it("returns true when industry is a moving company", () => {
    expect(isInterstateMovingApplicable("moving-company")).toEqual(true);
  });
});
