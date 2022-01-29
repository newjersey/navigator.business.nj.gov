import { LookupOwnershipTypeById, OwnershipTypes } from "./ownership";

describe("Ownership Tests", () => {
  it("has Ownership records", () => {
    expect(OwnershipTypes.length).toBeGreaterThan(0);
  });
  OwnershipTypes.forEach((i) => {
    it(`${i.id} has an id`, () => {
      expect(i.id.length).toBeGreaterThan(0);
    });
    it(`${i.id} has a name`, () => {
      expect(i.name.length).toBeGreaterThan(0);
    });
  });
  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupOwnershipTypeById("bob")?.id).toBe("");
    });
    it("returns ownership when a valid id is supplied", () => {
      expect(LookupOwnershipTypeById("veteran-owned")?.id).toEqual("veteran-owned");
    });
  });
});
