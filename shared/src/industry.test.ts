import { Industries, isIndustryIdGeneric, LookupIndustryById } from "./industry";

describe("Industry Tests", () => {
  it("has industry records", () => {
    expect(Industries.length).toBeGreaterThan(0);
  });

  for (const index of Industries) {
    it(`${index.id} has an id`, () => {
      expect(index.id.length).toBeGreaterThan(0);
    });

    it(`${index.id} has a name`, () => {
      expect(index.name.length).toBeGreaterThan(0);
    });

    it(`${index.id} has a description`, () => {
      expect(index.description.length).toBeGreaterThan(0);
    });
  }

  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupIndustryById("bob")?.id).toBe("");
    });

    it("returns industry record when a valid id is supplied", () => {
      expect(LookupIndustryById("restaurant")?.id).toEqual("restaurant");
    });
  });

  describe("isIndustryIdGeneric", () => {
    it("returns true for generic industry", () => {
      expect(isIndustryIdGeneric(LookupIndustryById("generic"))).toBe(true);
    });

    it("returns false for non-generic industry", () => {
      expect(isIndustryIdGeneric(LookupIndustryById("restaurant"))).toBe(false);
    });
  });

  describe("dev industry", () => {
    it("should always be disabled", () => {
      expect(LookupIndustryById("demo-only").isEnabled).toBe(false);
    });
  });
});
