import { LookupOperatingPhaseById, OperatingPhaseId, OperatingPhases } from "./operatingPhase";

describe("Operating Phase Tests", () => {
  it("has operating phase records", () => {
    expect(OperatingPhases.length).toBeGreaterThan(0);
  });

  for (const index of OperatingPhases) {
    it(`${index.id} has an id`, () => {
      expect(index.id.length).toBeGreaterThan(0);
    });
  }

  describe("Lookup By Id", () => {
    it("returns empty object when undefined is supplied", () => {
      expect(LookupOperatingPhaseById().id).toBe("");
    });

    it("returns oeprating phase record when a valid id is supplied", () => {
      expect(LookupOperatingPhaseById(OperatingPhaseId.NEEDS_TO_FORM)?.id).toEqual(
        OperatingPhaseId.NEEDS_TO_FORM
      );
    });
  });
});
