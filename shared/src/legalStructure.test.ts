import { LegalStructures, LookupLegalStructureById } from "./legalStructure";

describe("Legal Structure Tests", () => {
  it("has legal structure records", () => {
    expect(LegalStructures.length).toBeGreaterThan(0);
  });
  LegalStructures.forEach((i) => {
    it(`${i.id} has an id`, () => {
      expect(i.id.length).toBeGreaterThan(0);
    });
    it(`${i.id} has a name`, () => {
      expect(i.name.length).toBeGreaterThan(0);
    });
  });
  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupLegalStructureById("bob")?.id).toBe("");
    });
    it("returns legal structure record when a valid id is supplied", () => {
      expect(LookupLegalStructureById("sole-proprietorship")?.id).toEqual("sole-proprietorship");
    });
  });
});
