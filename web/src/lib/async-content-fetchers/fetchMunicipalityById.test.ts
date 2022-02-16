import { fetchMunicipalityById } from "./fetchMunicipalityById";

describe("fetchMunicipalityById", () => {
  it("returns a record when a valid id is supplied", async () => {
    const record = await fetchMunicipalityById("recbPn663zF8jPRoR");
    expect(record.townName).toEqual("Absecon");
  });
  it("returns a undefined when an invalid id is supplied", async () => {
    const record = await fetchMunicipalityById("00000000");
    expect(record).toBe(undefined);
  });
});
