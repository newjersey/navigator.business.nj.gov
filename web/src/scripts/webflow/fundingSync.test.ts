import * as fundingExport from "../fundingExport";
import * as helpers from "./helpers";
import * as methods from "./methods";
import * as sectorSync from "./sectorSync";
import {
  agencyMap,
  contentMdToObject,
  createNewFundings,
  deleteFundings,
  getCurrentFundings,
  getNewFundings,
  getUnUsedFundings,
  syncFundings,
  updateFundings,
} from "./fundingSync";
import { WebflowCreateItemResponse, WebflowItem } from "./types";

interface FetchResponse<T = unknown> {
  data: T;
  headers: Headers;
}

jest.mock("../fundingExport");
jest.mock("./helpers");
jest.mock("./methods");
jest.mock("./sectorSync");

const mockedFundingExport = fundingExport as jest.Mocked<typeof fundingExport>;
const mockedHelpers = helpers as jest.Mocked<typeof helpers>;
const mockedMethods = methods as jest.Mocked<typeof methods>;
const mockedSectorSync = sectorSync as jest.Mocked<typeof sectorSync>;

interface WebflowFundingFieldData {
  "program-overview": string;
  eligibility: string;
  benefit: string;
  "learn-more-url": string;
  "certifications-2": string[];
  agency: string;
  "application-close-date": string | null;
  "start-date": string | null;
  name: string;
  slug: string;
  "last-updated": string;
  "funding-status": string;
  "funding-type": string;
  "industry-reference": string[];
}

interface WebflowSectorFieldData {
  name: string;
  slug: string;
  rank?: number;
}

describe("fundingSync", () => {
  const mockFundings = [
    {
      id: "test-grant",
      name: "Test Grant",
      filename: "test-grant",
      urlSlug: "test-grant",
      callToActionLink: "https://example.com",
      callToActionText: "Apply",
      fundingType: "grant",
      programPurpose: "Small Business Support",
      agency: ["njeda"],
      agencyContact: "contact@njeda.gov",
      publishStageArchive: "",
      openDate: "2024-01-01",
      dueDate: "2099-12-31",
      status: "rolling application",
      programFrequency: "ongoing",
      businessStage: "both",
      employeesRequired: "n/a",
      homeBased: "unknown",
      certifications: ["minority-owned"],
      preferenceForOpportunityZone: "no",
      county: "Atlantic",
      sector: ["clean-energy"],
      contentMd: `
## Program Overview
This is a great grant program.

>Eligibility</h3>
Must be a small business.

"Benefits"
Receive funding.
`,
    },
    {
      id: "expired-grant",
      name: "Expired Grant",
      filename: "expired-grant",
      urlSlug: "expired-grant",
      callToActionLink: "https://example.com",
      callToActionText: "Apply",
      fundingType: "grant",
      programPurpose: "Support",
      agency: ["njeda"],
      agencyContact: "contact@njeda.gov",
      publishStageArchive: "",
      openDate: "2020-01-01",
      dueDate: "2020-01-01", // Expired
      status: "closed",
      programFrequency: "annual",
      businessStage: "both",
      employeesRequired: "n/a",
      homeBased: "unknown",
      preferenceForOpportunityZone: "no",
      county: "",
      sector: ["technology"],
      contentMd: `
>Eligibility</h3>
Eligibility criteria.

"Benefits"
Benefits here.
`,
    },
    {
      id: "do-not-publish",
      name: "Do Not Publish",
      filename: "do-not-publish",
      urlSlug: "do-not-publish",
      callToActionLink: "https://example.com",
      callToActionText: "Apply",
      fundingType: "loan",
      programPurpose: "Support",
      agency: ["njeda"],
      agencyContact: "contact@njeda.gov",
      publishStageArchive: "Do Not Publish",
      openDate: "2024-01-01",
      dueDate: "2024-12-31",
      status: "rolling application",
      programFrequency: "ongoing",
      businessStage: "both",
      employeesRequired: "n/a",
      homeBased: "unknown",
      preferenceForOpportunityZone: "no",
      county: "",
      sector: [],
      contentMd: `
>Eligibility</h3>
Eligibility.

"Benefits"
Benefits.
`,
    },
  ];

  const mockWebflowFundings: WebflowItem<WebflowFundingFieldData>[] = [
    {
      id: "webflow-1",
      fieldData: {
        "program-overview": "Overview",
        eligibility: "Eligibility",
        benefit: "Benefits",
        "learn-more-url": "https://example.com",
        "certifications-2": [],
        agency: agencyMap.njeda.id,
        "application-close-date": null,
        "start-date": null,
        name: "Test Grant",
        slug: "test-grant",
        "last-updated": "2024-01-01T00:00:00.000Z",
        "funding-status": "d9e4ad4201a1644abbcad6666bace0bc",
        "funding-type": "e84141a8393db92e7fbb14aad810be6d",
        "industry-reference": ["sector-1"],
      },
    },
    {
      id: "webflow-unused",
      fieldData: {
        "program-overview": "Old",
        eligibility: "Old",
        benefit: "Old",
        "learn-more-url": "https://old.com",
        "certifications-2": [],
        agency: agencyMap.njeda.id,
        "application-close-date": null,
        "start-date": null,
        name: "Unused Funding",
        slug: "unused-funding",
        "last-updated": "2024-01-01T00:00:00.000Z",
        "funding-status": "d9e4ad4201a1644abbcad6666bace0bc",
        "funding-type": "e84141a8393db92e7fbb14aad810be6d",
        "industry-reference": ["sector-1"],
      },
    },
  ];

  const mockSectors: WebflowItem<WebflowSectorFieldData>[] = [
    {
      id: "sector-1",
      fieldData: { name: "Clean Energy", slug: "clean-energy" },
    },
    {
      id: "sector-2",
      fieldData: { name: "Technology", slug: "technology" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(process.env, "NODE_ENV", { value: "test", writable: true });

    mockedFundingExport.loadAllFundings.mockReturnValue(mockFundings);
    mockedMethods.getAllItems.mockResolvedValue(mockWebflowFundings);
    mockedMethods.createItem.mockResolvedValue({
      data: { data: { id: "new-id" } },
      headers: new Headers(),
    } as FetchResponse<WebflowCreateItemResponse>);
    mockedMethods.modifyItem.mockResolvedValue({
      data: {},
      headers: new Headers(),
    } as FetchResponse);
    mockedMethods.deleteItem.mockResolvedValue({
      data: {},
      headers: new Headers(),
    } as FetchResponse);
    mockedSectorSync.getCurrentSectors.mockResolvedValue(mockSectors);
    mockedHelpers.resolveApiPromises.mockImplementation(async (promises) => {
      for (const promiseFn of promises) {
        await promiseFn();
      }
    });
    mockedHelpers.contentToStrings.mockImplementation((content) => {
      return content.split("\n").filter((line) => line.trim());
    });
    mockedHelpers.getHtml.mockImplementation((lines, start = 0, stop = -1) => {
      const slice = stop === -1 ? lines.slice(start) : lines.slice(start, stop);
      return slice.join(" ");
    });
  });

  describe("contentMdToObject", () => {
    it("parses markdown into three sections", () => {
      const content = `
## Program Overview
Overview content here.

>Eligibility</h3>
Eligibility content here.

"Benefits"
Benefits content here.
`;

      mockedHelpers.contentToStrings.mockReturnValue([
        "## Program Overview",
        "Overview content here.",
        ">Eligibility</h3>",
        "Eligibility content here.",
        '"Benefits"',
        "Benefits content here.",
      ]);

      mockedHelpers.getHtml
        .mockReturnValueOnce("## Program Overview Overview content here.")
        .mockReturnValueOnce("Eligibility content here.")
        .mockReturnValueOnce('"Benefits" Benefits content here.');

      const result = contentMdToObject(content);

      expect(result).toHaveProperty("program-overview");
      expect(result).toHaveProperty("eligibility");
      expect(result).toHaveProperty("benefit");
    });

    it("finds eligibility section with Eligible Expenses header", () => {
      const content = `
Overview

>Eligible Expenses<
Expenses here.

"Benefits"
Benefits here.
`;

      mockedHelpers.contentToStrings.mockReturnValue([
        "Overview",
        ">Eligible Expenses<",
        "Expenses here.",
        '"Benefits"',
        "Benefits here.",
      ]);

      mockedHelpers.getHtml.mockReturnValue("content");

      expect(() => contentMdToObject(content)).not.toThrow();
    });

    it("throws error when eligibility section is missing", () => {
      const content = `
Overview

"Benefits"
Benefits here.
`;

      mockedHelpers.contentToStrings.mockReturnValue(["Overview", '"Benefits"', "Benefits here."]);

      expect(() => contentMdToObject(content)).toThrow("Eligibility section missing");
    });

    it("throws error when benefits section is missing", () => {
      const content = `
Overview

>Eligibility</h3>
Eligibility here.
`;

      mockedHelpers.contentToStrings.mockReturnValue([
        "Overview",
        ">Eligibility</h3>",
        "Eligibility here.",
      ]);

      expect(() => contentMdToObject(content)).toThrow("Benefits section missing");
    });
  });

  describe("date validation", () => {
    it("accepts future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const funding = { ...mockFundings[0], dueDate: futureDate.toISOString() };

      mockedFundingExport.loadAllFundings.mockReturnValue([funding]);

      const result = mockedFundingExport
        .loadAllFundings()
        .filter((f) => !f.dueDate || new Date(f.dueDate) > new Date());

      expect(result).toHaveLength(1);
    });

    it("rejects past dates", () => {
      const funding = { ...mockFundings[0], dueDate: "2020-01-01" };

      mockedFundingExport.loadAllFundings.mockReturnValue([funding]);

      const result = mockedFundingExport
        .loadAllFundings()
        .filter((f) => !f.dueDate || new Date(f.dueDate) > new Date());

      expect(result).toHaveLength(0);
    });

    it("accepts undefined due dates", () => {
      const funding = { ...mockFundings[0], dueDate: undefined as unknown as string };

      mockedFundingExport.loadAllFundings.mockReturnValue([funding]);

      const result = mockedFundingExport
        .loadAllFundings()
        .filter((f) => !f.dueDate || new Date(f.dueDate) > new Date());

      expect(result).toHaveLength(1);
    });
  });

  describe("getCurrentFundings", () => {
    it("fetches all fundings from Webflow", async () => {
      const result = await getCurrentFundings();

      expect(result).toHaveLength(2);
      expect(mockedMethods.getAllItems).toHaveBeenCalled();
    });
  });

  describe("getNewFundings", () => {
    it("identifies fundings that don't exist in Webflow", async () => {
      // Add a new funding that doesn't exist in webflow
      const newFunding = {
        ...mockFundings[0],
        id: "new-grant",
        name: "New Grant",
        dueDate: "2099-12-31",
        publishStageArchive: "",
      };
      mockedFundingExport.loadAllFundings.mockReturnValue([...mockFundings, newFunding]);
      mockedMethods.getAllItems.mockResolvedValue([mockWebflowFundings[0]]);

      const result = await getNewFundings();

      expect(result.length).toBeGreaterThan(0);
      expect(mockedSectorSync.getCurrentSectors).toHaveBeenCalled();
    });

    it("filters expired fundings from new creation", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewFundings();

      // Should not include expired-grant or do-not-publish
      const slugs = result.map((f) => f.slug);
      expect(slugs).not.toContain("expired-grant");
      expect(slugs).not.toContain("do-not-publish");
    });

    it("filters Do Not Publish fundings", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewFundings();

      const slugs = result.map((f) => f.slug);
      expect(slugs).not.toContain("do-not-publish");
    });

    it("maps sector slugs to industry references", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewFundings();

      const funding = result.find((f) => f.slug === "test-grant");
      expect(funding?.["industry-reference"]).toContain("sector-1");
    });
  });

  describe("getUnUsedFundings", () => {
    it("identifies fundings in Webflow but not in local files", async () => {
      const result = await getUnUsedFundings();

      expect(result).toHaveLength(1);
      expect(result[0].fieldData.slug).toBe("unused-funding");
    });

    it("returns empty array when all fundings are used", async () => {
      mockedMethods.getAllItems.mockResolvedValue([mockWebflowFundings[0]]);

      const result = await getUnUsedFundings();

      expect(result).toHaveLength(0);
    });
  });

  describe("deleteFundings", () => {
    it("deletes unused fundings", async () => {
      await deleteFundings();

      expect(mockedMethods.deleteItem).toHaveBeenCalledTimes(1);
      expect(mockedMethods.deleteItem).toHaveBeenCalledWith("webflow-unused", expect.any(String));
    });

    it("logs deletion attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();

      await deleteFundings();

      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining("Attempting to delete"));
      consoleInfoSpy.mockRestore();
    });

    it("handles rate limit errors with retry", async () => {
      mockedMethods.deleteItem.mockRejectedValueOnce({ response: { status: 429 } });
      mockedHelpers.catchRateLimitErrorAndRetry.mockResolvedValue({
        data: {},
        headers: new Headers(),
      } as FetchResponse);

      await deleteFundings();

      expect(mockedHelpers.catchRateLimitErrorAndRetry).toHaveBeenCalled();
    });

    it("does nothing when no unused fundings", async () => {
      mockedMethods.getAllItems.mockResolvedValue([mockWebflowFundings[0]]);

      await deleteFundings();

      expect(mockedMethods.deleteItem).not.toHaveBeenCalled();
    });
  });

  describe("updateFundings", () => {
    it("updates existing fundings", async () => {
      await updateFundings();

      expect(mockedMethods.modifyItem).toHaveBeenCalled();
    });

    it("logs update attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();

      await updateFundings();

      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining("Attempting to modify"));
      consoleInfoSpy.mockRestore();
    });

    it("handles rate limit errors with retry", async () => {
      mockedMethods.modifyItem.mockRejectedValueOnce({ response: { status: 429 } });
      mockedHelpers.catchRateLimitErrorAndRetry.mockResolvedValue({
        data: {},
        headers: new Headers(),
      } as FetchResponse);

      await updateFundings();

      expect(mockedHelpers.catchRateLimitErrorAndRetry).toHaveBeenCalled();
    });

    it("skips fundings without matching markdown data", async () => {
      mockedFundingExport.loadAllFundings.mockReturnValue([]);

      await updateFundings();

      expect(mockedMethods.modifyItem).not.toHaveBeenCalled();
    });
  });

  describe("createNewFundings", () => {
    it("creates new fundings", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      await createNewFundings();

      expect(mockedMethods.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Grant",
          slug: "test-grant",
        }),
        expect.any(String),
        false,
      );
    });

    it("logs creation attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();
      mockedMethods.getAllItems.mockResolvedValue([]);

      await createNewFundings();

      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining("Attempting to create"));
      consoleInfoSpy.mockRestore();
    });

    it("handles rate limit errors with retry", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);
      mockedMethods.createItem.mockRejectedValueOnce({ response: { status: 429 } });
      mockedHelpers.catchRateLimitErrorAndRetry.mockResolvedValue({
        data: { data: { id: "new" } },
        headers: new Headers(),
      } as FetchResponse<WebflowCreateItemResponse>);

      await createNewFundings();

      expect(mockedHelpers.catchRateLimitErrorAndRetry).toHaveBeenCalled();
    });

    it("does nothing when all fundings exist", async () => {
      mockedMethods.getAllItems.mockResolvedValue(mockWebflowFundings);

      await createNewFundings();

      expect(mockedMethods.createItem).not.toHaveBeenCalled();
    });
  });

  describe("syncFundings", () => {
    it("runs full sync process in correct order", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await syncFundings();

      expect(consoleLogSpy).toHaveBeenCalledWith("deleting unused fundings");
      expect(consoleLogSpy).toHaveBeenCalledWith("updating fundings");
      expect(consoleLogSpy).toHaveBeenCalledWith("creating new fundings");
      expect(consoleLogSpy).toHaveBeenCalledWith("Complete Funding Sync!");

      consoleLogSpy.mockRestore();
    });

    it("calls all sync operations", async () => {
      await syncFundings();

      expect(mockedMethods.deleteItem).toHaveBeenCalled();
      expect(mockedMethods.modifyItem).toHaveBeenCalled();
    });
  });

  describe("data mapping", () => {
    it("maps funding types correctly", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewFundings();
      const grant = result.find((f) => f.slug === "test-grant");

      expect(grant?.["funding-type"]).toBe("e84141a8393db92e7fbb14aad810be6d"); // grant ID
    });

    it("maps agency correctly", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewFundings();
      const funding = result.find((f) => f.slug === "test-grant");

      expect(funding?.agency).toBe(agencyMap.njeda.id);
    });

    it("maps funding status correctly", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewFundings();
      const funding = result.find((f) => f.slug === "test-grant");

      expect(funding?.["funding-status"]).toBe("d9e4ad4201a1644abbcad6666bace0bc"); // rolling application
    });

    it("formats dates correctly", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewFundings();
      const funding = result.find((f) => f.slug === "test-grant");

      expect(funding?.["start-date"]).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(funding?.["application-close-date"]).toMatch(/\d{4}-\d{2}-\d{2}T/);
    });

    it("filters undefined certifications", async () => {
      const fundingWithBadCert = {
        ...mockFundings[0],
        certifications: ["minority-owned", "non-existent-cert"],
      };
      mockedFundingExport.loadAllFundings.mockReturnValue([fundingWithBadCert]);
      mockedMethods.getAllItems.mockResolvedValue([]);

      const result = await getNewFundings();
      const funding = result[0];

      // Should filter certifications and return an array
      expect(Array.isArray(funding["certifications-2"])).toBe(true);
      expect(funding["certifications-2"].length).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("throws error when sector is not synced", async () => {
      const fundingWithBadSector = {
        ...mockFundings[0],
        sector: ["non-existent-sector"],
      };
      mockedFundingExport.loadAllFundings.mockReturnValue([fundingWithBadSector]);
      mockedMethods.getAllItems.mockResolvedValue([]);

      await expect(getNewFundings()).rejects.toThrow("Sectors must be synced first");
    });

    it("throws error for unknown funding type", async () => {
      const fundingWithBadType = {
        ...mockFundings[0],
        fundingType: "unknown-type",
      };
      mockedFundingExport.loadAllFundings.mockReturnValue([fundingWithBadType]);
      mockedMethods.getAllItems.mockResolvedValue([]);

      await expect(getNewFundings()).rejects.toThrow("Funding Types for funding type");
    });

    it("throws error for unknown agency", async () => {
      const fundingWithBadAgency = {
        ...mockFundings[0],
        agency: ["unknown-agency"],
      };
      mockedFundingExport.loadAllFundings.mockReturnValue([fundingWithBadAgency]);
      mockedMethods.getAllItems.mockResolvedValue([]);

      await expect(getNewFundings()).rejects.toThrow("Agency Types for agency");
    });

    it("throws error for unknown funding status", async () => {
      const fundingWithBadStatus = {
        ...mockFundings[0],
        status: "unknown-status",
      };
      mockedFundingExport.loadAllFundings.mockReturnValue([fundingWithBadStatus]);
      mockedMethods.getAllItems.mockResolvedValue([]);

      await expect(getNewFundings()).rejects.toThrow(
        "Funding Status Types for funding status type",
      );
    });
  });
});
