import { isRetailPierceEarsApplicable } from "@/lib/domain-logic/isRetailPierceEarsApplicable";

describe("isRetailPierceEarsApplicable", () => {
  it("returns false when there is no industry", () => {
    expect(isRetailPierceEarsApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry is not retail", () => {
    expect(isRetailPierceEarsApplicable("logistics")).toEqual(false);
  });

  it("returns true when industry is a retail", () => {
    expect(isRetailPierceEarsApplicable("retail")).toEqual(true);
  });
});
