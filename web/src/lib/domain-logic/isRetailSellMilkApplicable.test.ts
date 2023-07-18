import { isRetailSellMilkApplicable } from "@/lib/domain-logic/isRetailSellMilkApplicable";

describe("isRetailSellMilkApplicable", () => {
  it("returns false when there is no industry", () => {
    expect(isRetailSellMilkApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry is not retail", () => {
    expect(isRetailSellMilkApplicable("logistics")).toEqual(false);
  });

  it("returns true when industry is a retail", () => {
    expect(isRetailSellMilkApplicable("retail")).toEqual(true);
  });
});
