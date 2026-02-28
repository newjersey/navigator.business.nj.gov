import fs from "fs";
import * as helpers from "./helpers";
import * as methods from "./methods";
import {
  createNewSectors,
  deleteSectors,
  getCurrentSectors,
  getNewSectors,
  getSectors,
  getSortedSectors,
  getUnUsedSectors,
  getUpdatedSectorNames,
  reSortSectors,
  syncSectors,
  updateSectorNames,
  allIndustryId,
} from "./sectorSync";
import {FetchResponse, WebflowCreateItemResponse} from "./types";
import {
  generateMockSector,
  generateWebflowSector,
  MockSector,
} from "@/test/factories";

jest.mock("fs");
jest.mock("./helpers");
jest.mock("./methods");

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedHelpers = helpers as jest.Mocked<typeof helpers>;
const mockedMethods = methods as jest.Mocked<typeof methods>;

describe("sectorSync", () => {
  const mockSectors: MockSector[] = [
    generateMockSector(),
    generateMockSector(),
    generateMockSector(),
  ];

  const mockSectorsJson = {
    arrayOfSectors: mockSectors,
  };

  const mockWebflowSectors = [
    generateWebflowSector({
      id: allIndustryId,
      fieldData: { name: "All Industries", slug: "all-industries", rank: 1 },
    }),
    generateWebflowSector({
      id: "webflow-1",
      fieldData: { name: mockSectors[0].name, slug: mockSectors[0].id, rank: 2 },
    }),
    generateWebflowSector({
      id: "webflow-2",
      fieldData: { name: "Old Tech Name", slug: mockSectors[1].id, rank: 3 },
    }),
    generateWebflowSector(),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(process.env, "NODE_ENV", { value: "test", writable: true });
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSectorsJson));
  });

  describe("getSectors", () => {
    it("reads sectors from JSON file", () => {
      const result = getSectors();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(mockSectors[0].id);
      expect(result[0].name).toBe(mockSectors[0].name);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining("sectors.json"),
        "utf8",
      );
    });

    it("parses JSON correctly", () => {
      const result = getSectors();

      expect(result[1].id).toBe(mockSectors[1].id);
      expect(result[1].name).toBe(mockSectors[1].name);
      expect(result[2].id).toBe(mockSectors[2].id);
      expect(result[2].name).toBe(mockSectors[2].name);
    });
  });

  describe("getCurrentSectors", () => {
    it("fetches all sectors from Webflow", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);

      const result = await getCurrentSectors();

      expect(result).toHaveLength(4);
      expect(mockedMethods.getAllItems).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe("getNewSectors", () => {
    it("identifies sectors that don't exist in Webflow", async () => {
      const webflowWithoutThird = mockWebflowSectors.slice(0, 3);
      mockedMethods.getAllItems.mockResolvedValue(webflowWithoutThird);

      const result = await getNewSectors();

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe(mockSectors[2].id);
      expect(result[0].name).toBe(mockSectors[2].name);
    });

    it("returns empty array when all sectors exist", async () => {
      const allSectors = [
        ...mockWebflowSectors,
        {
          id: "webflow-4",
          fieldData: { name: mockSectors[2].name, slug: mockSectors[2].id },
        },
      ];
      mockedMethods.getAllItems.mockResolvedValue(allSectors);

      const result = await getNewSectors();

      expect(result).toHaveLength(0);
    });

    it("maps sectors to WebflowSector format", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewSectors();

      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("slug");
      expect(result[0].slug).toBe(mockSectors[0].id);
    });
  });

  describe("getUnUsedSectors", () => {
    it("identifies sectors in Webflow but not in local JSON", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);

      const result = await getUnUsedSectors();

      expect(result).toHaveLength(1);
      expect(result[0].fieldData.slug).toBe(mockWebflowSectors[3].fieldData.slug);
    });

    it("excludes allIndustryId from unused list", async () => {
      const sectorsWithAllIndustry = [
        {
          id: allIndustryId,
          fieldData: { name: "All Industries", slug: "all-industries" },
        },
      ];
      mockedMethods.getAllItems.mockResolvedValue(sectorsWithAllIndustry);

      const result = await getUnUsedSectors();

      expect(result).toHaveLength(0);
    });

    it("returns empty array when all sectors are used", async () => {
      const usedSectors = mockWebflowSectors.filter((s) => s.fieldData.slug !== mockWebflowSectors[3].fieldData.slug);
      mockedMethods.getAllItems.mockResolvedValue(usedSectors);

      const result = await getUnUsedSectors();

      expect(result).toHaveLength(0);
    });
  });

  describe("getUpdatedSectorNames", () => {
    it("identifies sectors with name changes", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);

      const result = await getUpdatedSectorNames();

      expect(result).toHaveLength(1);
      expect(result[0].fieldData.slug).toBe(mockSectors[1].id);
      expect(result[0].fieldData.name).toBe(mockSectors[1].name);
    });

    it("preserves other fieldData properties", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);

      const result = await getUpdatedSectorNames();

      expect(result[0].id).toBe("webflow-2");
      expect(result[0].fieldData.rank).toBe(3);
    });

    it("returns empty array when no names need updating", async () => {
      const correctNames = [
        {
          id: "webflow-1",
          fieldData: { name: mockSectors[0].name, slug: mockSectors[0].id },
        },
      ];
      mockedMethods.getAllItems.mockResolvedValue(correctNames);

      const result = await getUpdatedSectorNames();

      expect(result).toHaveLength(0);
    });
  });

  describe("getSortedSectors", () => {
    it("returns sectors sorted alphabetically with allIndustry first", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);

      const result = await getSortedSectors();

      expect(result[0].id).toBe(allIndustryId);
      expect(result[0].rank).toBe(1);

      // Check that sectors after All Industries are sorted alphabetically
      const sectorNames = result.slice(1).map(s => s.fieldData.name);
      const sortedNames = [...sectorNames].sort();
      expect(sectorNames).toEqual(sortedNames);
    });

    it("assigns sequential rank numbers", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);

      const result = await getSortedSectors();

      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);
    });

    it("excludes unused sectors from sorting", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);

      const result = await getSortedSectors();

      const hasUnused = result.some((s) => s.fieldData.slug === "unused");
      expect(hasUnused).toBe(false);
    });
  });

  describe("deleteSectors", () => {
    it("deletes unused sectors", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.deleteItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);

      await deleteSectors();

      expect(mockedMethods.deleteItem).toHaveBeenCalledTimes(1);
      expect(mockedMethods.deleteItem).toHaveBeenCalledWith(mockWebflowSectors[3].id, expect.any(String));
    });

    it("logs deletion attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.deleteItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);

      await deleteSectors();

      expect(consoleInfoSpy).toHaveBeenCalledWith(`Attempting to delete ${mockWebflowSectors[3].fieldData.name}`);
      consoleInfoSpy.mockRestore();
    });

    it("does nothing when no unused sectors", async () => {
      const usedOnly = mockWebflowSectors.filter((s) => s.fieldData.slug !== mockWebflowSectors[3].fieldData.slug);
      mockedMethods.getAllItems.mockResolvedValue(usedOnly);

      await deleteSectors();

      expect(mockedMethods.deleteItem).not.toHaveBeenCalled();
    });
  });

  describe("updateSectorNames", () => {
    it("updates sectors with name changes", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.modifyItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);

      await updateSectorNames();

      expect(mockedMethods.modifyItem).toHaveBeenCalledTimes(1);
      expect(mockedMethods.modifyItem).toHaveBeenCalledWith("webflow-2", expect.any(String), {
        name: mockSectors[1].name,
      });
    });

    it("logs update attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.modifyItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);

      await updateSectorNames();

      expect(consoleInfoSpy).toHaveBeenCalledWith(`Attempting to modify ${mockSectors[1].name}`);
      consoleInfoSpy.mockRestore();
    });

    it("does nothing when no names need updating", async () => {
      const correctNames = [
        {
          id: "webflow-1",
          fieldData: { name: mockSectors[0].name, slug: mockSectors[0].id },
        },
      ];
      mockedMethods.getAllItems.mockResolvedValue(correctNames);

      await updateSectorNames();

      expect(mockedMethods.modifyItem).not.toHaveBeenCalled();
    });
  });

  describe("createNewSectors", () => {
    it("creates new sectors", async () => {
      const withoutThird = mockWebflowSectors.slice(0, 3);
      mockedMethods.getAllItems.mockResolvedValue(withoutThird);
      mockedMethods.createItem.mockResolvedValue({
        data: { data: { id: "new-id" } },
        headers: new Headers(),
      } as FetchResponse<WebflowCreateItemResponse>);

      await createNewSectors();

      expect(mockedMethods.createItem).toHaveBeenCalledTimes(1);
      expect(mockedMethods.createItem).toHaveBeenCalledWith(
        { name: mockSectors[2].name, slug: mockSectors[2].id },
        expect.any(String),
        false,
      );
    });

    it("logs creation attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
      mockedMethods.getAllItems.mockResolvedValue([]);
      mockedMethods.createItem.mockResolvedValue({
        data: { data: { id: "new-id" } },
        headers: new Headers(),
      } as FetchResponse<WebflowCreateItemResponse>);

      await createNewSectors();

      expect(consoleInfoSpy).toHaveBeenCalledWith(`Attempting to create ${mockSectors[0].name}`);
      consoleInfoSpy.mockRestore();
    });

    it("does nothing when all sectors exist", async () => {
      const allExist = [
        ...mockWebflowSectors,
        { id: "webflow-4", fieldData: { name: mockSectors[2].name, slug: mockSectors[2].id } },
      ];
      mockedMethods.getAllItems.mockResolvedValue(allExist);

      await createNewSectors();

      expect(mockedMethods.createItem).not.toHaveBeenCalled();
    });
  });

  describe("reSortSectors", () => {
    it("updates rank for all sectors", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.modifyItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);

      await reSortSectors();

      expect(mockedMethods.modifyItem).toHaveBeenCalledTimes(3);
      expect(mockedMethods.modifyItem).toHaveBeenCalledWith(allIndustryId, expect.any(String), {
        rank: 1,
      });
    });

    it("logs sorting attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.modifyItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);

      await reSortSectors();

      expect(consoleInfoSpy).toHaveBeenCalledWith("Attempting to sort All Industries");
      consoleInfoSpy.mockRestore();
    });

    it("assigns ranks in correct order", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.modifyItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);

      await reSortSectors();

      const calls = mockedMethods.modifyItem.mock.calls;
      expect(calls[0][2]).toEqual({ rank: 1 }); // All Industries
      expect(calls[1][2]).toEqual({ rank: 2 }); // First sector
      expect(calls[2][2]).toEqual({ rank: 3 }); // Second sector
    });
  });

  describe("syncSectors", () => {
    it("runs full sync process in correct order", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.deleteItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);
      mockedMethods.modifyItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);
      mockedMethods.createItem.mockResolvedValue({
        data: { data: { id: "new" } },
        headers: new Headers(),
      } as FetchResponse<WebflowCreateItemResponse>);
      mockedHelpers.wait.mockResolvedValue();

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await syncSectors();

      expect(consoleLogSpy).toHaveBeenCalledWith("deleting unused sectors");
      expect(consoleLogSpy).toHaveBeenCalledWith("updating renamed sectors");
      expect(consoleLogSpy).toHaveBeenCalledWith("creating new sectors");
      expect(consoleLogSpy).toHaveBeenCalledWith("updating sectors order");
      expect(consoleLogSpy).toHaveBeenCalledWith("Complete Sectors Sync!");

      consoleLogSpy.mockRestore();
    });

    it("waits between operations", async () => {
      // Need to include at least allIndustryId for getSortedSectors to work
      mockedMethods.getAllItems.mockResolvedValue([mockWebflowSectors[0]]);
      mockedMethods.deleteItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);
      mockedMethods.modifyItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);
      mockedMethods.createItem.mockResolvedValue({
        data: { data: { id: "new" } },
        headers: new Headers(),
      } as FetchResponse<WebflowCreateItemResponse>);
      mockedHelpers.wait.mockResolvedValue();

      await syncSectors();

      expect(mockedHelpers.wait).toHaveBeenCalledTimes(3);
    });

    it("calls all sync operations", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowSectors);
      mockedMethods.deleteItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);
      mockedMethods.modifyItem.mockResolvedValue({ data: {}, headers: new Headers() } as FetchResponse);
      mockedMethods.createItem.mockResolvedValue({
        data: { data: { id: "new" } },
        headers: new Headers(),
      } as FetchResponse<WebflowCreateItemResponse>);
      mockedHelpers.wait.mockResolvedValue();

      await syncSectors();

      expect(mockedMethods.deleteItem).toHaveBeenCalled();
      expect(mockedMethods.modifyItem).toHaveBeenCalled();
      expect(mockedMethods.createItem).toHaveBeenCalled();
    });
  });
});
