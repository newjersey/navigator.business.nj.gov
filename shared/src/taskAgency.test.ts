import { LookupTaskAgencyById, arrayOfTaskAgencies as TaskAgencies } from "./taskAgency";

describe("TaskAgencies Tests", () => {
  it("has TaskAgencies records", () => {
    expect(TaskAgencies.length).toBeGreaterThan(0);
  });

  for (const index of TaskAgencies) {
    it(`${index.id} has an id`, () => {
      expect(index.id.length).toBeGreaterThan(0);
    });

    it(`${index.id} has a name`, () => {
      expect(index.name.length).toBeGreaterThan(0);
    });
  }

  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupTaskAgencyById("bob")?.id).toBe("");
    });

    it("returns agency record when a valid id is supplied", () => {
      expect(LookupTaskAgencyById("nj-consumer-affairs")?.id).toEqual("nj-consumer-affairs");
    });
  });
});
