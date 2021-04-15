import { randomInt } from "../../test/factories";
import * as airtableClient from "../airtable/airtableClient";
import { AirtableMunicipality } from "../airtable/airtableClient";
import { getAllMunicipalities } from "./loadMunicipalities";

jest.mock("../airtable/airtableClient", () => ({
  selectAll: jest.fn(),
}));
const mockAirtableClient = airtableClient as jest.Mocked<typeof airtableClient>;

describe("loadAirtable", () => {
  describe("getAllMunicipalities", () => {
    it("returns a list of municipality objects from Airtable", async () => {
      const airtable1 = generateAirtableMunicipality({
        id: "123",
        "County Name": ["Bergen"],
        "Town Name": "Newark (Bergen County)",
        Municipality: "Newark",
      });
      mockAirtableClient.selectAll.mockResolvedValue([airtable1, generateAirtableMunicipality({})]);
      const municipalities = await getAllMunicipalities();
      expect(mockAirtableClient.selectAll).toHaveBeenCalledWith("Municipalities", "Grid view");
      expect(municipalities).toHaveLength(2);
      expect(municipalities[0]).toEqual({
        name: "Newark",
        displayName: "Newark (Bergen County)",
        county: "Bergen",
        id: "123",
      });
    });
  });

  const generateAirtableMunicipality = (overrides: Partial<AirtableMunicipality>): AirtableMunicipality => {
    return {
      id: "some-id-" + randomInt(),
      Municipality: "some-municipality-" + randomInt(),
      "County (Data)": ["some-county-id-" + randomInt()],
      "Town Name": "some-town-name-" + randomInt(),
      "Town Website": "some-town-website-" + randomInt(),
      "County Name": ["some-county-name-" + randomInt()],
      "County Clerk Phone": ["some-phone-" + randomInt()],
      "County Clerks Office Webpage": ["some-clerk-webpage-" + randomInt()],
      "County Website": ["some-county-website-" + randomInt()],
      ...overrides,
    };
  };
});
