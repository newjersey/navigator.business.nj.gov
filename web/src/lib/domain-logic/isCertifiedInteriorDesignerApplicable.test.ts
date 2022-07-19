import { isCertifiedInteriorDesignerApplicable } from "./isCertifiedInteriorDesignerApplicable";

describe("isCertifiedInteriorDesignerApplicable", () => {
  it("returns false when no industry is supplied", () => {
    expect(isCertifiedInteriorDesignerApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not have a certified interior designer option", () => {
    expect(isCertifiedInteriorDesignerApplicable("auto-body-repair")).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isCertifiedInteriorDesignerApplicable("fake-industry")).toEqual(false);
  });

  it("returns true when industry has a certified interior designer option", () => {
    expect(isCertifiedInteriorDesignerApplicable("interior-designer")).toEqual(true);
  });
});
