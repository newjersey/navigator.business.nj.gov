import fs from "fs";
import matter from "gray-matter";
import {
  LicenseData,
  loadAllLicenses,
  loadAllNavigatorLicenses,
  loadAllNavigatorWebflowLicenses,
  loadNavigatorLicense,
  writeMarkdownString,
} from "./licenseLoader";
import { randomInt } from "@businessnjgovnavigator/shared";

jest.mock("fs");
jest.mock("gray-matter");

const mockFs = fs as jest.Mocked<typeof fs>;
const mockMatter = matter as jest.MockedFunction<typeof matter>;

describe("licenseLoader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockLicense = (overrides?: Partial<LicenseData>): LicenseData => {
    const id = randomInt();
    const licenseId = `license-${id}`;
    return {
      id: licenseId,
      urlSlug: `license-slug-${randomInt()}`,
      name: `License ${randomInt()}`,
      displayname: `License Display ${randomInt()}`,
      filename: `license-${randomInt()}`,
      licenseCertificationClassification: "PROFESSIONAL",
      contentMd: `License content ${randomInt()}`,
      ...overrides,
    };
  };

  describe("loadAllNavigatorWebflowLicenses", () => {
    it("loads all webflow license files", () => {
      const mockFileNames = ["license1.md", "license2.md"];
      const mockFileContent = `---
id: test-license
urlSlug: test-license
name: Test License
displayname: Test License Display
licenseCertificationClassification: PROFESSIONAL
---
Test content`;

      (mockFs.readdirSync as jest.Mock).mockReturnValue(mockFileNames);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue({
        data: {
          id: "test-license",
          urlSlug: "test-license",
          name: "Test License",
          displayname: "Test License Display",
          licenseCertificationClassification: "PROFESSIONAL",
        },
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const licenses = loadAllNavigatorWebflowLicenses();

      expect(licenses).toHaveLength(2);
      expect(mockFs.readdirSync).toHaveBeenCalledTimes(1);
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2);
      expect(licenses[0].filename).toBe("license1");
    });
  });

  describe("loadAllNavigatorLicenses", () => {
    it("loads licenses from navigator, municipal, and tasks directories", () => {
      const mockFileNames = ["license1.md"];
      const mockFileContent = "test content";

      (mockFs.readdirSync as jest.Mock).mockReturnValue(mockFileNames);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
      mockMatter.mockReturnValue({
        data: createMockLicense(),
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const licenses = loadAllNavigatorLicenses();

      expect(mockFs.readdirSync).toHaveBeenCalledTimes(3);
      expect(licenses.length).toBeGreaterThan(0);
    });

    it("filters tasks by syncToWebflow flag", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((dir) => {
        if (dir.toString().includes("license-tasks")) {
          return [];
        }
        if (dir.toString().includes("municipal-tasks")) {
          return [];
        }
        return ["task1.md", "task2.md"];
      });

      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter
        .mockReturnValueOnce({
          data: createMockLicense({ syncToWebflow: true }),
          content: "Test content",
          excerpt: "",
          matter: "",
          stringify: jest.fn(),
          orig: Buffer.from(""),
          language: "",
        })
        .mockReturnValueOnce({
          data: createMockLicense({ syncToWebflow: false }),
          content: "Test content",
          excerpt: "",
          matter: "",
          stringify: jest.fn(),
          orig: Buffer.from(""),
          language: "",
        });

      const licenses = loadAllNavigatorLicenses();

      const syncedLicenses = licenses.filter((l) => l.syncToWebflow === true);
      expect(syncedLicenses.length).toBeGreaterThan(0);
    });

    it("includes licenses with syncToWebflow as string 'true'", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((dir) => {
        if (dir.toString().includes("license-tasks")) {
          return [];
        }
        if (dir.toString().includes("municipal-tasks")) {
          return [];
        }
        return ["task1.md"];
      });

      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter.mockReturnValueOnce({
        data: createMockLicense({ syncToWebflow: "true" }),
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const licenses = loadAllNavigatorLicenses();

      expect(licenses.some((l) => l.syncToWebflow === "true")).toBe(true);
    });
  });

  describe("loadAllLicenses", () => {
    it("combines navigator and webflow licenses", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue(["license1.md"]);
      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter.mockReturnValue({
        data: createMockLicense(),
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const licenses = loadAllLicenses();

      expect(licenses.length).toBeGreaterThan(0);
      expect(mockFs.readdirSync).toHaveBeenCalled();
    });
  });

  describe("loadNavigatorLicense", () => {
    it("loads license from navigator directory when it exists", () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.toString().includes("license-tasks");
      });
      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter.mockReturnValue({
        data: createMockLicense(),
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const [license, filePath] = loadNavigatorLicense("test-license.md");

      expect(license.filename).toBe("test-license");
      expect(filePath).toContain("license-tasks");
    });

    it("loads license from municipal directory when not in navigator", () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.toString().includes("municipal-tasks");
      });
      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter.mockReturnValue({
        data: createMockLicense(),
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const [license, filePath] = loadNavigatorLicense("test-license.md");

      expect(license.filename).toBe("test-license");
      expect(filePath).toContain("municipal-tasks");
    });

    it("loads license from tasks directory when not in other directories", () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.toString().includes("roadmaps/tasks");
      });
      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter.mockReturnValue({
        data: createMockLicense(),
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const [license, filePath] = loadNavigatorLicense("test-license.md");

      expect(license.filename).toBe("test-license");
      expect(filePath).toContain("roadmaps/tasks");
    });

    it("loads license from webflow directory as fallback", () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path.toString().includes("webflow-licenses");
      });
      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter.mockReturnValue({
        data: createMockLicense(),
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const [license, filePath] = loadNavigatorLicense("test-license.md");

      expect(license.filename).toBe("test-license");
      expect(filePath).toContain("webflow-licenses");
    });

    it("throws error when file is not found in any directory", () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => loadNavigatorLicense("nonexistent.md")).toThrow("couldn't find file when trying to load from MD");
    });
  });

  describe("writeMarkdownString", () => {
    it("writes complete markdown string with all fields", () => {
      const license = createMockLicense({
        id: "test-license",
        urlSlug: "test-license",
        name: "Test License",
        displayname: "Test License Display",
        filename: "test-license",
        contentMd: "Test content",
        webflowId: "wf-123",
        webflowName: "Webflow License Name",
        callToActionLink: "https://example.com",
        callToActionText: "Apply Now",
        agencyId: "agency-123",
        agencyAdditionalContext: "Additional context",
        divisionPhone: "555-1234",
        industryId: "industry-123",
        webflowType: "Professional",
        summaryDescriptionMd: "This is a summary",
      });

      const markdown = writeMarkdownString(license);

      expect(markdown).toContain("id: test-license");
      expect(markdown).toContain("webflowId: wf-123");
      expect(markdown).toContain("webflowName: Webflow License Name");
      expect(markdown).toContain("callToActionLink: https://example.com");
      expect(markdown).toContain("callToActionText: Apply Now");
      expect(markdown).toContain("agencyId: agency-123");
      expect(markdown).toContain("summaryDescriptionMd: \"This is a summary\"");
      expect(markdown).toContain("---");
      expect(markdown).toContain("Test content");
    });

    it("omits optional fields when not present", () => {
      const license = createMockLicense({
        id: "test-license",
        urlSlug: "test-license",
        name: "Test License",
        displayname: "Test License Display",
        filename: "test-license",
        contentMd: "Test content",
      });

      const markdown = writeMarkdownString(license);

      expect(markdown).toContain("id: test-license");
      expect(markdown).toContain("licenseCertificationClassification: PROFESSIONAL");
      expect(markdown).not.toContain("webflowName:");
      expect(markdown).not.toContain("callToActionLink:");
      expect(markdown).not.toContain("agencyId:");
    });

    it("preserves content markdown in output", () => {
      const license = createMockLicense({
        contentMd: "This is the license content\nwith multiple lines",
      });

      const markdown = writeMarkdownString(license);

      expect(markdown).toContain("This is the license content\nwith multiple lines");
    });
  });
});
