import { LookupMunicipalityByName, Municipalities } from "./municipality";

describe("Municipality Tests", () => {
  it("has municipality records", () => {
    expect(Object.keys(Municipalities).length).toBeGreaterThan(0);
  });
});

describe("Municipality Lookup By Name", () => {
  it("returns an empty municipality if none are found", () => {
    expect(LookupMunicipalityByName("BobTown")).toEqual({
      county: "",
      displayName: "",
      id: "",
      name: "",
    });
  });

  it("returns municipality results when found", () => {
    expect(LookupMunicipalityByName("East Brunswick").name).toEqual("East Brunswick");
  });
});
