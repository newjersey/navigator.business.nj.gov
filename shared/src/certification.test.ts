import { Certifications, LookupCertificationById } from "./certification";

describe("Certification Tests", () => {
  it("has certification records", () => {
    expect(Certifications.length).toBeGreaterThan(0);
  });
  Certifications.forEach((i) => {
    it(`${i.id} has an id`, () => {
      expect(i.id.length).toBeGreaterThan(0);
    });
    it(`${i.id} has a name`, () => {
      expect(i.name.length).toBeGreaterThan(0);
    });
  });
  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupCertificationById("bob")?.id).toBe("");
    });
    it("returns certification when a valid id is supplied", () => {
      expect(LookupCertificationById("veteran-owned")?.id).toEqual("veteran-owned");
    });
  });
});
