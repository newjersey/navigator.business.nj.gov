import { arrayOfOwnershipTypes, LookupOwnershipTypeById } from "./ownership";

describe("Ownership Tests", () => {
  it("has Ownership records", () => {
    expect(arrayOfOwnershipTypes.length).toBeGreaterThan(0);
  });

  for (const index of arrayOfOwnershipTypes) {
    it(`${index.id} has an id`, () => {
      expect(index.id.length).toBeGreaterThan(0);
    });

    it(`${index.id} has a name`, () => {
      expect(index.name.length).toBeGreaterThan(0);
    });
  }

  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupOwnershipTypeById("bob")?.id).toBe("");
    });

    it("returns ownership when a valid id is supplied", () => {
      expect(LookupOwnershipTypeById("veteran-owned")?.id).toEqual("veteran-owned");
    });
  });
});
