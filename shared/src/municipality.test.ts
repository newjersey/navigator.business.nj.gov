import {
  buildMunicipalityCmsOptions,
  LookupMunicipalityByName,
  Municipalities,
} from "./municipality";
import { generateMunicipalityDetail } from "./test/factories";

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

describe("buildMunicipalityCmsOptions", () => {
  it("emits sorted town names after the All wildcard", () => {
    const options = buildMunicipalityCmsOptions([
      generateMunicipalityDetail({ townName: "Newark" }),
      generateMunicipalityDetail({ townName: "Absecon" }),
    ]);

    expect(options).toEqual(["All", "Absecon", "Newark"]);
  });

  it("collapses a town name shared across counties into a single option", () => {
    const options = buildMunicipalityCmsOptions([
      generateMunicipalityDetail({ countyName: "Somerset", townName: "Franklin Township" }),
      generateMunicipalityDetail({ countyName: "Warren", townName: "Franklin Township" }),
      generateMunicipalityDetail({ townName: "Newark" }),
    ]);

    expect(options).toEqual(["All", "Franklin Township", "Newark"]);
  });

  it("builds unique options for every real municipality record", () => {
    const options = buildMunicipalityCmsOptions(Object.values(Municipalities));

    expect(options[0]).toEqual("All");
    expect(new Set(options).size).toEqual(options.length);
    expect(options).toContain("Newark");
  });
});
