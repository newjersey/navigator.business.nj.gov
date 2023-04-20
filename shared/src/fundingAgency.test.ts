import { arrayOfFundingAgencies as FundingAgencies, LookupFundingAgencyById } from "./fundingAgency";

describe("FundingAgency Tests", () => {
  it("has fundingAgency records", () => {
    expect(FundingAgencies.length).toBeGreaterThan(0);
  });

  for (const index of FundingAgencies) {
    it(`${index.id} has an id`, () => {
      expect(index.id.length).toBeGreaterThan(0);
    });

    it(`${index.id} has a name`, () => {
      expect(index.name.length).toBeGreaterThan(0);
    });
  }

  describe("Lookup By Id", () => {
    it("returns empty object when invalid id is supplied", () => {
      expect(LookupFundingAgencyById("bob")?.id).toBe("");
    });

    it("returns agency record when a valid id is supplied", () => {
      expect(LookupFundingAgencyById("njdol")?.id).toEqual("njdol");
    });
  });
});
