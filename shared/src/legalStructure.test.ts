import { getMergedConfig } from "./contexts/configContext";
import { LegalStructures, LookupLegalStructureById } from "./legalStructure";

describe("Legal Structure Tests", () => {
  it("has legal structure records", () => {
    expect(LegalStructures.length).toBeGreaterThan(0);
  });

  it("has a CMS label for every legal structure", () => {
    const labels: Readonly<Record<string, string>> =
      getMergedConfig().profileDefaults.fields.legalStructureId.default.optionLabels;

    expect(Object.keys(labels).sort()).toEqual(
      LegalStructures.map((structure) => structure.id).sort(),
    );
    for (const structure of LegalStructures) {
      expect(labels[structure.id].trim()).not.toBe("");
    }
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
