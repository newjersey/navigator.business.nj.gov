import { Industries, LookupIndustryById } from "./industry";

describe("Industry Tests", () => {
  it("has industry records", () => {
    expect(Industries.length).toBeGreaterThan(0);
  });
  Industries.forEach((i) => {
    it(`${i.id} has an id`, () => {
      expect(i.id.length).toBeGreaterThan(0);
    });
    it(`${i.id} has a name`, () => {
      expect(i.name.length).toBeGreaterThan(0);
    });
    it(`${i.id} has a description`, () => {
      expect(i.description.length).toBeGreaterThan(0);
    });
  });
  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupIndustryById("bob")?.id).toBe("");
    });
    it("returns industry record when a valid id is supplied", () => {
      expect(LookupIndustryById("restaurant")?.id).toEqual("restaurant");
    });
  });
});
