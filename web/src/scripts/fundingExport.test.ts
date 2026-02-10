import fs from "fs";
import matter from "gray-matter";
import { exportFundings, loadAllFundings, Funding } from "./fundingExport";

jest.mock("fs");
jest.mock("gray-matter");

const mockFs = fs as jest.Mocked<typeof fs>;
const mockMatter = matter as jest.MockedFunction<typeof matter>;

const generateMockFundingExportData = (overrides?: Partial<Omit<Funding, "contentMd">>): Omit<Funding, "contentMd"> => ({
  id: "test-id",
  name: "Test Funding",
  filename: "funding1",
  urlSlug: "test-funding",
  callToActionLink: "https://example.com",
  callToActionText: "Apply Now",
  fundingType: "Grant",
  programPurpose: "Business Support",
  agency: ["Test Agency"],
  agencyContact: "contact@test.com",
  publishStageArchive: "",
  openDate: "2024-01-01",
  dueDate: "2024-12-31",
  status: "Open",
  programFrequency: "Annual",
  businessStage: "Early Stage",
  employeesRequired: "0",
  homeBased: "Yes",
  certifications: [],
  preferenceForOpportunityZone: "",
  county: "",
  sector: [],
  ...overrides,
});

describe("fundingExport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadAllFundings", () => {
    it("loads all funding files from the directory", () => {
      const mockFileNames = ["funding1.md", "funding2.md"];
      const mockFundingData = generateMockFundingExportData();

      (mockFs.readdirSync as jest.Mock).mockReturnValue(mockFileNames);
      mockFs.readFileSync.mockReturnValue("mock file content");
      mockMatter.mockReturnValue({
        data: mockFundingData,
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const fundings = loadAllFundings();

      expect(fundings).toHaveLength(2);
      expect(mockFs.readdirSync).toHaveBeenCalledTimes(1);
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2);
    });

    it("converts funding markdown with escaped quotes", () => {
      const mockFileNames = ["funding1.md"];
      const mockFundingData = generateMockFundingExportData({
        id: "test-id",
        name: 'Test "Funding"',
        filename: "funding1",
      });

      (mockFs.readdirSync as jest.Mock).mockReturnValue(mockFileNames);
      mockFs.readFileSync.mockReturnValue("mock file content");
      mockMatter.mockReturnValue({
        data: mockFundingData,
        content: 'Content with "quotes"',
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });

      const fundings = loadAllFundings();

      expect(fundings[0].contentMd).toBe('Content with ""quotes""');
      expect(fundings[0].filename).toBe("funding1");
    });
  });

  describe("exportFundings", () => {
    it("exports fundings to CSV file", () => {
      const mockFileNames = ["funding1.md"];
      const mockFundingData = generateMockFundingExportData({
        id: "test-id",
        name: "Test Funding",
        filename: "funding1",
        urlSlug: "test-funding",
        callToActionLink: "https://example.com",
        callToActionText: "Apply Now",
        fundingType: "Grant",
        programPurpose: "Business Support",
        agency: ["Test Agency"],
        agencyContact: "contact@test.com",
        publishStageArchive: "",
        openDate: "2024-01-01",
        dueDate: "2024-12-31",
        status: "Open",
        programFrequency: "Annual",
        businessStage: "Early Stage",
        employeesRequired: "0",
        homeBased: "Yes",
        certifications: [],
        preferenceForOpportunityZone: "",
        county: "",
        sector: [],
      });

      (mockFs.readdirSync as jest.Mock).mockReturnValue(mockFileNames);
      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter.mockReturnValue({
        data: mockFundingData,
        content: "Test content",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });
      mockFs.writeFileSync.mockImplementation(() => {
        // Mock implementation
      });

      exportFundings();

      expect(mockFs.writeFileSync).toHaveBeenCalledWith("fundings.csv", expect.stringContaining("id,name,filename"));
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "fundings.csv",
        expect.stringContaining('"test-id","Test Funding"')
      );
    });

    it("trims content markdown in CSV output", () => {
      const mockFileNames = ["funding1.md"];
      const mockFundingData = generateMockFundingExportData({
        id: "test-id",
        name: "Test Funding",
        filename: "funding1",
        urlSlug: "test-funding",
        callToActionLink: "",
        callToActionText: "",
        fundingType: "",
        programPurpose: "",
        agency: [],
        agencyContact: "",
        publishStageArchive: "",
        openDate: "",
        dueDate: "",
        status: "",
        programFrequency: "",
        businessStage: "",
        employeesRequired: "",
        homeBased: "",
        certifications: [],
        preferenceForOpportunityZone: "",
        county: "",
        sector: [],
      });

      (mockFs.readdirSync as jest.Mock).mockReturnValue(mockFileNames);
      mockFs.readFileSync.mockReturnValue("test content");
      mockMatter.mockReturnValue({
        data: mockFundingData,
        content: "  Test content with whitespace  ",
        excerpt: "",
        matter: "",
        stringify: jest.fn(),
        orig: Buffer.from(""),
        language: "",
      });
      mockFs.writeFileSync.mockImplementation(() => {
        // Mock implementation
      });

      exportFundings();

      const csvCall = mockFs.writeFileSync.mock.calls[0][1] as string;
      expect(csvCall).toContain('Test content with whitespace"');
      expect(csvCall).not.toContain('  Test content with whitespace  "');
    });
  });
});
