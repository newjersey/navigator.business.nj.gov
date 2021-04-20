import { loadAllMunicipalities } from "./loadMunicipalities";
import * as api from "../api-client/apiClient";
import { generateMunicipalityDetail } from "../../test/factories";

jest.mock("../api-client/apiClient", () => ({
  getMunicipalities: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("loadMunicipalities", () => {
  describe("loadAllMunicipalities", () => {
    it("returns a list of municipality objects", async () => {
      const municipality = generateMunicipalityDetail({
        id: "123",
        countyName: "Bergen",
        townDisplayName: "Newark (Bergen County)",
        townName: "Newark",
      });
      mockApi.getMunicipalities.mockResolvedValue([municipality, generateMunicipalityDetail({})]);
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
});
