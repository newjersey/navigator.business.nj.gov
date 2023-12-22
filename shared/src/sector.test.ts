import { LookupSectorTypeById, arrayOfSectors as sectors } from "./sector";

describe("Sector Tests", () => {
  it("has sector records", () => {
    expect(sectors.length).toBeGreaterThan(0);
  });

  for (const index of sectors) {
    it(`${index.id} has an id`, () => {
      expect(index.id.length).toBeGreaterThan(0);
    });

    it(`${index.id} has a name`, () => {
      expect(index.name.length).toBeGreaterThan(0);
    });
  }

  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupSectorTypeById("bob")?.id).toBe("");
    });

    it("returns sector record when a valid id is supplied", () => {
      expect(LookupSectorTypeById("cannabis")?.id).toEqual("cannabis");
    });
  });
});
