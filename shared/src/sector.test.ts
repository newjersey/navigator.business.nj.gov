import { arrayOfSectors as sectors, LookupSectorTypeById } from "./sector";

describe("Sector Tests", () => {
  it("has sector records", () => {
    expect(sectors.length).toBeGreaterThan(0);
  });
  sectors.forEach((i) => {
    it(`${i.id} has an id`, () => {
      expect(i.id.length).toBeGreaterThan(0);
    });
    it(`${i.id} has a name`, () => {
      expect(i.name.length).toBeGreaterThan(0);
    });
  });
  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupSectorTypeById("bob")?.id).toBe("");
    });
    it("returns sector record when a valid id is supplied", () => {
      expect(LookupSectorTypeById("cannabis")?.id).toEqual("cannabis");
    });
  });
});
