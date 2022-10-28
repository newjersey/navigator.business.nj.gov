import { isCpaRequiredApplicable } from "./isCpaRequiredApplicable";

describe("isCpaRequiredApplicable", () => {
  it("returns false when no industry is supplied", () => {
    expect(isCpaRequiredApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not have a CPA option", () => {
    expect(isCpaRequiredApplicable("auto-body-repair")).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isCpaRequiredApplicable("fake-industry")).toEqual(false);
  });

  it("returns true when industry has a CPA option", () => {
    expect(isCpaRequiredApplicable("certified-public-accountant")).toEqual(true);
  });
});
