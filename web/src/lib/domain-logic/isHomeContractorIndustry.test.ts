import { isHomeContractorIndustry } from "@/lib/domain-logic/isHomeContractorIndustry";

describe("isHomeContractorIndustry", () => {
  it("returns true when home-contractor is argument", () => {
    expect(isHomeContractorIndustry("home-contractor")).toBe(true);
  });

  it("returns false when home-contractor is not the argument", () => {
    expect(isHomeContractorIndustry("some-value")).toBe(false);
  });
});
