/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { CategoryItem, PageItem } from "@businessnjgovnavigator/shared/types";
import * as fs from "fs";
import matter from "gray-matter";
import { pagesCollectionId } from "src/scripts/webflow/webflowIds";
import * as pagePull from "./pagePull";
import * as methods from "./methods";
import { WebflowItem, WebflowPageFieldData } from "./types";

const {
  getCurrentWebflowPages,
  loadAllPagesFromNavigator,
  loadCategoryMap,
  pullPages,
  webflowPageToNavigatorFormat,
  writePageFile,
} = pagePull;

jest.mock("./methods", () => ({
  getAllItems: jest.fn().mockResolvedValue([]),
  normalizeQuotes: (text: string): string =>
    text.replaceAll(/[\u2018\u2019]/g, "'").replaceAll(/[\u201C\u201D]/g, '"'),
  htmlToMarkdown: (html: string): string => html,
}));

jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockReturnValue([]),
  readFileSync: jest.fn().mockReturnValue(""),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock("gray-matter", () => {
  const mockMatter = jest.fn(() => ({ data: {}, content: "" }));
  (mockMatter as any).stringify = jest.fn(
    (_body: string, data: Record<string, unknown>) => `---\n${JSON.stringify(data)}\n---\n`,
  );
  return mockMatter;
});

const mockedMethods = methods as jest.Mocked<typeof methods>;
const mockedFs = jest.mocked(fs);
const mockedMatter = matter as jest.MockedFunction<typeof matter>;

const generateWebflowPage = (
  overrides?: Partial<WebflowItem<WebflowPageFieldData>>,
): WebflowItem<WebflowPageFieldData> => ({
  id: `page-id-${randomInt()}`,
  fieldData: {
    name: `Page ${randomInt()}`,
    slug: `page-${randomInt()}`,
  },
  ...overrides,
});

describe("pagePull", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadCategoryMap", () => {
    it("should return empty map when directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      expect(loadCategoryMap().size).toBe(0);
    });

    it("should build a webflowId-to-slug map from JSON files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["plan.json"] as any);
      const category: CategoryItem = {
        name: "Plan a Business",
        slug: "plan",
        webflowId: "wf-id-plan",
      };
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(category) as any);

      const result = loadCategoryMap();

      expect(result.get("wf-id-plan")).toBe("plan");
    });
  });

  describe("loadAllPagesFromNavigator", () => {
    it("should return empty array when directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      expect(loadAllPagesFromNavigator()).toEqual([]);
    });

    it("should load pages from markdown files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["page.md"] as any);
      const pageData: PageItem = { name: "Test Page", slug: "test-page", webflowId: "wf-id-1" };
      mockedMatter.mockReturnValue({ data: pageData, content: "" } as any);

      const result = loadAllPagesFromNavigator();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(pageData);
    });

    it("should filter out non-markdown files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["page.md", "image.png"] as any);
      mockedMatter.mockReturnValue({ data: {}, content: "" } as any);

      loadAllPagesFromNavigator();

      expect(mockedMatter).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCurrentWebflowPages", () => {
    it("should call getAllItems with the pages collection ID", async () => {
      await getCurrentWebflowPages();
      expect(mockedMethods.getAllItems).toHaveBeenCalledWith(pagesCollectionId);
    });
  });

  describe("webflowPageToNavigatorFormat", () => {
    const categoryMap = new Map([["category-webflow-id", "plan"]]);
    const pageSlugById = new Map([["parent-page-id", "parent-page-slug"]]);

    it("should map core fields correctly", () => {
      const item = generateWebflowPage({
        id: "wf-id-123",
        fieldData: { name: "Test Page", slug: "test-page", category: "category-webflow-id" },
      });

      const result = webflowPageToNavigatorFormat(item, categoryMap, pageSlugById);

      expect(result.name).toBe("Test Page");
      expect(result.slug).toBe("test-page");
      expect(result.webflowId).toBe("wf-id-123");
      expect(result.category).toBe("plan");
    });

    it("should map primary-page ID to slug", () => {
      const item = generateWebflowPage();
      item.fieldData["primary-page"] = "parent-page-id";

      const result = webflowPageToNavigatorFormat(item, categoryMap, pageSlugById);

      expect(result["primary-page"]).toBe("parent-page-slug");
    });

    it("should warn and omit category when ID is unrecognized", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const item = generateWebflowPage();
      item.fieldData.category = "unknown-id";

      const result = webflowPageToNavigatorFormat(item, new Map(), pageSlugById);

      expect(result.category).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown category ID"));
      consoleSpy.mockRestore();
    });

    it("should warn and omit primary-page when ID is unrecognized", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const item = generateWebflowPage();
      item.fieldData["primary-page"] = "unknown-parent-id";

      const result = webflowPageToNavigatorFormat(item, categoryMap, new Map());

      expect(result["primary-page"]).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown primary-page ID"));
      consoleSpy.mockRestore();
    });

    it("should convert link fields from { url } to plain string", () => {
      const item = generateWebflowPage();
      (item.fieldData as any)["link-1"] = { url: "https://example.com" };

      const result = webflowPageToNavigatorFormat(item, categoryMap, pageSlugById);

      expect(result["link-1"]).toBe("https://example.com");
    });

    it("should apply htmlToMarkdown to main-text fields", () => {
      const item = generateWebflowPage();
      (item.fieldData as any)["main-text-1"] = "<p>some content</p>";

      const result = webflowPageToNavigatorFormat(item, categoryMap, pageSlugById);

      // mock returns html as-is, so result equals the input
      expect(result["main-text-1"]).toBe("<p>some content</p>");
    });

    it("should apply normalizeQuotes to text fields", () => {
      const item = generateWebflowPage();
      item.fieldData.name = "It\u2019s a page";

      const result = webflowPageToNavigatorFormat(item, categoryMap, pageSlugById);

      expect(result.name).toBe("It's a page");
    });
  });

  describe("writePageFile", () => {
    it("should write a file at {slug}.md", () => {
      const page: PageItem = { name: "Test", slug: "test", webflowId: "id" };
      writePageFile(page);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("test.md"),
        expect.any(String),
        "utf8",
      );
    });

    it("should create the directory if it does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      writePageFile({ name: "Test", slug: "test", webflowId: "id" });

      expect(mockedFs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe("pullPages", () => {
    it("should write a file for each page in Webflow", async () => {
      const webflowPages = [generateWebflowPage(), generateWebflowPage()];
      mockedMethods.getAllItems.mockResolvedValue(webflowPages);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullPages();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it("should update existing pages matched by webflowId", async () => {
      const existingId = "existing-page-id";
      const webflowPage = generateWebflowPage({ id: existingId });
      mockedMethods.getAllItems.mockResolvedValue([webflowPage]);

      mockedFs.readdirSync.mockReturnValue(["existing.md"] as any);
      mockedMatter.mockReturnValue({
        data: { name: "Existing", slug: "existing", webflowId: existingId },
        content: "",
      } as any);

      await pullPages();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it("should create new files for pages not found in Navigator", async () => {
      const newPage = generateWebflowPage({ id: "brand-new-id" });
      mockedMethods.getAllItems.mockResolvedValue([newPage]);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullPages();

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${newPage.fieldData.slug}.md`),
        expect.any(String),
        "utf8",
      );
    });
  });
});
