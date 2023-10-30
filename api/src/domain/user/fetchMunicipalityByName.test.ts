import { fetchMunicipalityByName } from "@domain/user/fetchMunicipalityByName";

describe("fetchMunicipalityByName", () => {
  it("returns a record when a valid name is supplied", async () => {
    const record = await fetchMunicipalityByName("TRENTON");
    expect(record?.townName).toEqual("Trenton");
  });

  it("returns undefined when an invalid name is supplied", async () => {
    const record = await fetchMunicipalityByName("Testville");
    expect(record).toEqual(undefined);
  });
});
