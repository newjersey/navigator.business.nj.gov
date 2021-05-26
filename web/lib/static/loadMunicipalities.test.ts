import { loadAllMunicipalities } from "./loadMunicipalities";
import { generateMunicipalityDetail } from "@/test/factories";
import fs from "fs";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadMunicipalities", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  it("returns a list of municipality objects", async () => {
    const municipality1 = generateMunicipalityDetail({
      id: "123",
      countyName: "Bergen",
      townDisplayName: "Newark (Bergen County)",
      townName: "Newark",
    });

    const municipality2 = generateMunicipalityDetail({});

    const json = JSON.stringify({
      [municipality1.id]: municipality1,
      [municipality2.id]: municipality2,
    });

    mockedFs.readFileSync.mockReturnValue(json);

    const municipalities = await loadAllMunicipalities();
    expect(municipalities).toHaveLength(2);
    expect(municipalities[0]).toEqual({
      name: "Newark",
      displayName: "Newark (Bergen County)",
      county: "Bergen",
      id: "123",
    });
  });
});
