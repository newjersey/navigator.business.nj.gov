import { LegalStructures, LookupLegalStructureById } from "./legalStructure";

describe("Legal Structure Tests", () => {
  it("has legal structure records", () => {
    expect(LegalStructures.length).toBeGreaterThan(0);
  });

  for (const index of LegalStructures) {
    it(`${index.id} has an id`, () => {
      expect(index.id.length).toBeGreaterThan(0);
    });

    it(`${index.id} has a name`, () => {
      expect(index.name.length).toBeGreaterThan(0);
    });
  }

  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupLegalStructureById("bob")?.id).toBe("");
    });

    it("returns legal structure record when a valid id is supplied", () => {
      expect(LookupLegalStructureById("sole-proprietorship")?.id).toEqual("sole-proprietorship");
    });
  });
});
