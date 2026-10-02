import fs from "node:fs";
import { loadAllHousingMunicipalities } from "./loadHousingMunicipalities";

describe("loadAllHousingMunicipalities", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the municipality records sorted by name", () => {
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify({ b: { name: "Trenton" }, a: { name: "Newark" } }));

    const names = loadAllHousingMunicipalities().map((municipality) => municipality.name);

    expect(names).toEqual(["Newark", "Trenton"]);
  });

  it("keeps the parse failure as the cause when the records are malformed", () => {
    jest.spyOn(fs, "readFileSync").mockReturnValue("{not json");

    let thrown: unknown;
    try {
      loadAllHousingMunicipalities();
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual(new Error("Could not retrieve records"));
    expect((thrown as Error).cause).toBeInstanceOf(SyntaxError);
  });
});
