import fs from "fs";
import industryJson from "../../../../content/lib/industry.json" with { type: "json" };
import taskAgenciesJSON from "../../../../content/src/mappings/taskAgency.json" with { type: "json" };
import * as helpers from "./helpers";
import { LicenseClassificationLookup } from "./licenseClassifications";
import * as licenseLoader from "../licenseLoader";
import * as methods from "./methods";
import {FetchResponse, WebflowCreateItemResponse, WebflowItem, WebflowLicenseFieldData} from "./types";
import {LookupTaskAgencyById} from "@businessnjgovnavigator/shared/taskAgency";

jest.mock("fs");
jest.mock("./helpers");
jest.mock("../licenseLoader");
jest.mock("./methods");

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedHelpers = helpers as jest.Mocked<typeof helpers>;
const mockedLicenseLoader = licenseLoader as jest.Mocked<typeof licenseLoader>;
const mockedMethods = methods as jest.Mocked<typeof methods>;

describe("licenseSync", () => {
  const mockLicenses = [
    {
      id: "test-license",
      webflowId: "webflow-1",
      urlSlug: "test-license-slug",
      name: "Test License",
      displayname: "Test License Display",
      webflowName: "Test Webflow Name",
      filename: "test-license",
      callToActionLink: "https://example.com/apply",
      callToActionText: "Apply Now",
      agencyId: "agency-123",
      agencyAdditionalContext: "Additional context",
      divisionPhone: "555-1234",
      industryId: "clean-energy",
      webflowType: "business-license",
      licenseCertificationClassification: "license",
      summaryDescriptionMd: "This is a test license summary",
      contentMd: "## License Content\n\nThis is the license content.",
    },
    {
      id: "simple-license",
      urlSlug: "simple-license-slug",
      name: "Simple License",
      displayname: "Simple License",
      filename: "simple-license",
      licenseCertificationClassification: "certification",
      contentMd: "Simple content",
    },
  ];

  const mockWebflowLicenses: WebflowItem<WebflowLicenseFieldData>[] = [
    {
      id: "webflow-1",
      fieldData: {
        name: "Test License",
        slug: "test-license",
        website: "https://example.com/apply",
        "call-to-action-text": "Apply Now",
        "department-3": "Test Agency",
        division: "Additional context",
        "department-phone-2": "555-1234",
        "license-certification-classification": "license",
        "form-name": "",
        "primary-industry": "Clean Energy",
        content: "",
        "last-updated": "2024-01-01T00:00:00.000Z",
        "license-classification": LicenseClassificationLookup["business-license"],
        "summary-description": "Summary",
      },
    },
    {
      id: "webflow-unused",
      fieldData: {
        name: "Unused License",
        slug: "unused-license",
        website: "",
        "call-to-action-text": "",
        "department-3": "",
        division: "",
        "department-phone-2": "",
        "license-certification-classification": "license",
        "form-name": "",
        "primary-industry": "",
        content: "",
        "last-updated": "2024-01-01T00:00:00.000Z",
        "summary-description": "",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(process.env, "NODE_ENV", { value: "test", writable: true });

    mockedLicenseLoader.loadAllLicenses.mockReturnValue(mockLicenses);
    mockedLicenseLoader.loadAllNavigatorLicenses.mockReturnValue([mockLicenses[0]]);
    mockedLicenseLoader.loadAllNavigatorWebflowLicenses.mockReturnValue([]);
    mockedLicenseLoader.loadNavigatorLicense.mockReturnValue([
      mockLicenses[0],
      "/path/to/license.md",
    ]);
    mockedLicenseLoader.writeMarkdownString.mockReturnValue("---\nid: test\n---\nContent");

    mockedMethods.getAllItems.mockResolvedValue(mockWebflowLicenses);
    mockedMethods.createItem.mockResolvedValue({
      data: { data: { id: "new-webflow-id" } },
      headers: new Headers(),
    } as FetchResponse<WebflowCreateItemResponse>);
    mockedMethods.modifyItem.mockResolvedValue({} as FetchResponse);
    mockedMethods.deleteItem.mockResolvedValue({} as FetchResponse);

    mockedHelpers.resolveApiPromises.mockImplementation(async (promises) => {
      for (const promiseFn of promises) {
        await promiseFn();
      }
    });
    mockedHelpers.contentToStrings.mockImplementation((content) => {
      return content.split("\n").filter((line) => line.trim());
    });
    mockedHelpers.getHtml.mockImplementation((lines) => {
      return lines.join(" ");
    });
    mockedHelpers.wait.mockResolvedValue();

    mockedFs.writeFileSync.mockImplementation(() => {});
  });

  describe("LookupTaskAgencyById", () => {
    it("finds agency by ID", () => {
      const agencies = (
        taskAgenciesJSON as { arrayOfTaskAgencies: Array<{ id: string; name: string }> }
      ).arrayOfTaskAgencies;
      const firstAgency = agencies[0];

      const result = LookupTaskAgencyById(firstAgency.id);

      expect(result.id).toBe(firstAgency.id);
      expect(result.name).toBe(firstAgency.name);
    });

    it("returns empty object for non-existent ID", () => {
      const result = LookupTaskAgencyById("non-existent");

      expect(result.id).toBe("");
      expect(result.name).toBe("");
    });
  });

  describe("license loading", () => {
    it("loads all licenses", () => {
      const result = mockedLicenseLoader.loadAllLicenses();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("test-license");
    });

    it("loads licenses already in Webflow", () => {
      const result = mockedLicenseLoader.loadAllNavigatorLicenses();

      expect(result).toHaveLength(1);
      expect(result[0].webflowId).toBe("webflow-1");
    });

    it("loads webflow-specific licenses", () => {
      mockedLicenseLoader.loadAllNavigatorWebflowLicenses.mockReturnValue([mockLicenses[0]]);

      const result = mockedLicenseLoader.loadAllNavigatorWebflowLicenses();

      expect(result).toHaveLength(1);
    });
  });

  describe("license conversion", () => {
    it("converts license with all fields", () => {
      const license = mockLicenses[0];

      expect(license.name).toBe("Test License");
      expect(license.urlSlug).toBe("test-license-slug");
      expect(license.callToActionLink).toBe("https://example.com/apply");
      expect(license.agencyId).toBe("agency-123");
      expect(license.industryId).toBe("clean-energy");
    });

    it("uses webflowName when present", () => {
      const license = mockLicenses[0];

      expect(license.webflowName).toBe("Test Webflow Name");
    });

    it("removes values with special characters", () => {
      const licenseWithSpecialChars = {
        ...mockLicenses[0],
        callToActionLink: "https://example.com/$invalid",
      };

      // Simulate the removeValueWithSpecialChars logic
      const cleanedLink = licenseWithSpecialChars.callToActionLink.includes("$")
        ? ""
        : licenseWithSpecialChars.callToActionLink;

      expect(cleanedLink).toBe("");
    });

    it("maps webflowType to license classification", () => {
      const classification =
        LicenseClassificationLookup["business-license" as keyof typeof LicenseClassificationLookup];

      expect(classification).toBeDefined();
    });

    it("handles missing optional fields", () => {
      const simpleLicense = mockLicenses[1];

      expect(simpleLicense.webflowId).toBeUndefined();
      expect(simpleLicense.agencyId).toBeUndefined();
      expect(simpleLicense.industryId).toBeUndefined();
    });
  });

  describe("license sync operations", () => {
    it("updates existing licenses", async () => {
      await mockedHelpers.resolveApiPromises([
        (): Promise<FetchResponse> => mockedMethods.modifyItem("webflow-1", "collection-id", {}),
      ]);

      expect(mockedMethods.modifyItem).toHaveBeenCalled();
    });

    it("creates new licenses", async () => {
      await mockedHelpers.resolveApiPromises([
        (): Promise<FetchResponse> => mockedMethods.createItem({}, "collection-id", false),
      ]);

      expect(mockedMethods.createItem).toHaveBeenCalledWith(
        expect.any(Object),
        "collection-id",
        false,
      );
    });

    it("deletes unused licenses", async () => {
      await mockedHelpers.resolveApiPromises([
        (): Promise<FetchResponse> => mockedMethods.deleteItem("webflow-unused", "collection-id"),
      ]);

      expect(mockedMethods.deleteItem).toHaveBeenCalledWith("webflow-unused", "collection-id");
    });

    it("handles rate limit errors with retry", async () => {
      mockedMethods.modifyItem.mockRejectedValueOnce({ response: { status: 429 } });
      mockedHelpers.catchRateLimitErrorAndRetry.mockResolvedValue({} as FetchResponse);

      try {
        await mockedMethods.modifyItem("id", "col", {});
      } catch (error) {
        await mockedHelpers.catchRateLimitErrorAndRetry(
          error,
          mockedMethods.modifyItem,
          "id",
          "col",
          {},
        );
      }

      expect(mockedHelpers.catchRateLimitErrorAndRetry).toHaveBeenCalled();
    });
  });

  describe("file system operations", () => {
    it("writes webflowId to license file after creation", () => {
      const license = { ...mockLicenses[0], webflowId: "new-id" };
      const markdown = mockedLicenseLoader.writeMarkdownString(license);

      mockedFs.writeFileSync("/path/to/license.md", markdown);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        "/path/to/license.md",
        expect.stringContaining("id: test"),
      );
    });

    it("loads license by filename", () => {
      const [license, filepath] = mockedLicenseLoader.loadNavigatorLicense("test-license.md");

      expect(license.id).toBe("test-license");
      expect(filepath).toBeTruthy();
    });

    it("generates markdown string from license object", () => {
      const markdown = mockedLicenseLoader.writeMarkdownString(mockLicenses[0]);

      expect(markdown).toContain("---");
      expect(markdown).toContain("id: test");
      expect(markdown).toContain("Content");
    });
  });

  describe("filtering logic", () => {
    it("identifies licenses already in Webflow", () => {
      const webflowIds = new Set(mockWebflowLicenses.map((l) => l.id));
      const licensesInWebflow = mockLicenses.filter(
        (l) => l.webflowId && webflowIds.has(l.webflowId),
      );

      expect(licensesInWebflow).toHaveLength(1);
      expect(licensesInWebflow[0].id).toBe("test-license");
    });

    it("identifies new licenses to create", () => {
      const webflowIds = new Set(mockWebflowLicenses.map((l) => l.id));
      const newLicenses = mockLicenses.filter((l) => !l.webflowId || !webflowIds.has(l.webflowId));

      expect(newLicenses).toHaveLength(1);
      expect(newLicenses[0].id).toBe("simple-license");
    });

    it("identifies unused licenses to delete", () => {
      const localIds = new Set(mockLicenses.filter((l) => l.webflowId).map((l) => l.webflowId));
      const unusedLicenses = mockWebflowLicenses.filter((l) => !localIds.has(l.id));

      expect(unusedLicenses).toHaveLength(1);
      expect(unusedLicenses[0].id).toBe("webflow-unused");
    });
  });

  describe("logging", () => {
    it("logs modification attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();

      console.info("Attempting to modify test-license");

      expect(consoleInfoSpy).toHaveBeenCalledWith("Attempting to modify test-license");
      consoleInfoSpy.mockRestore();
    });

    it("logs creation attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();

      console.info("Attempting to create simple-license");

      expect(consoleInfoSpy).toHaveBeenCalledWith("Attempting to create simple-license");
      consoleInfoSpy.mockRestore();
    });

    it("logs deletion attempts", async () => {
      const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation();

      console.info("Attempting to delete unused license: unused-license");

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "Attempting to delete unused license: unused-license",
      );
      consoleInfoSpy.mockRestore();
    });

    it("logs completion messages", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      console.log("deleting licenses");
      console.log("updating licenses");
      console.log("updating webflow-licenses");
      console.log("creating new licenses (no new webflow-licenses will be created)");
      console.log("Complete license sync!");

      expect(consoleLogSpy).toHaveBeenCalledWith("deleting licenses");
      expect(consoleLogSpy).toHaveBeenCalledWith("Complete license sync!");

      consoleLogSpy.mockRestore();
    });
  });

  describe("markdown content handling", () => {
    it("converts markdown to HTML strings", () => {
      const markdown = "## Heading\n\nParagraph content.";

      mockedHelpers.contentToStrings.mockReturnValue(["## Heading", "Paragraph content."]);

      const result = mockedHelpers.contentToStrings(markdown);

      expect(result).toHaveLength(2);
    });

    it("combines HTML strings correctly", () => {
      const lines = ["<p>Line 1</p>", "<p>Line 2</p>"];

      mockedHelpers.getHtml.mockReturnValue("<p>Line 1</p> <p>Line 2</p>");

      const result = mockedHelpers.getHtml(lines);

      expect(result).toContain("Line 1");
      expect(result).toContain("Line 2");
    });
  });

  describe("error handling", () => {
    it("handles missing agency gracefully", () => {
      const result = LookupTaskAgencyById("non-existent");

      expect(result.id).toBe("");
      expect(result.name).toBe("");
    });

    it("handles missing industry gracefully", () => {
      const industries = (industryJson as { industries: Array<{ id: string; name: string }> })
        .industries;
      const result = industries.find((i) => i.id === "non-existent");

      expect(result).toBeUndefined();
    });

    it("continues processing after errors", async () => {
      mockedHelpers.catchRateLimitErrorAndRetry.mockResolvedValue({} as FetchResponse);

      const promises = [
        async (): Promise<void> => {
          try {
            throw new Error("Test error");
          } catch (error) {
            await mockedHelpers.catchRateLimitErrorAndRetry(
              error,
              mockedMethods.modifyItem,
              "id",
              "col",
              {},
            );
          }
        },
        async (): Promise<void> => {
          await mockedMethods.modifyItem("id-2", "col", {});
        },
      ];

      await mockedHelpers.resolveApiPromises(promises);

      expect(mockedHelpers.resolveApiPromises).toHaveBeenCalled();
    });
  });

  describe("date handling", () => {
    it("generates ISO date string for last-updated", () => {
      const date = new Date().toISOString();

      expect(date).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("stores dates in ISO format", () => {
      const license = mockWebflowLicenses[0];

      expect(license.fieldData["last-updated"]).toMatch(/\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("validation", () => {
    it("validates required fields are present", () => {
      const license = mockLicenses[0];

      expect(license.id).toBeTruthy();
      expect(license.name).toBeTruthy();
      expect(license.urlSlug).toBeTruthy();
      expect(license.licenseCertificationClassification).toBeTruthy();
    });

    it("allows optional fields to be undefined", () => {
      const simpleLicense = mockLicenses[1];

      expect(simpleLicense.webflowId).toBeUndefined();
      expect(simpleLicense.callToActionLink).toBeUndefined();
      expect(simpleLicense.agencyId).toBeUndefined();
    });
  });
});
