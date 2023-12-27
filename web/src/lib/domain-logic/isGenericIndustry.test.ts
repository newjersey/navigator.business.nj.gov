import { isGenericIndustry } from "@/lib/domain-logic/isGenericIndustry";

describe("isGenericIndustry", () => {
  it("returns true when generic is argument", () => {
    expect(isGenericIndustry("generic")).toBe(true);
  });

  it("returns false when generic is not the argument", () => {
    expect(isGenericIndustry("some-value")).toBe(false);
  });
});
