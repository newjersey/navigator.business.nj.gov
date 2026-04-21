/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { PageItem } from "@businessnjgovnavigator/shared/types";
import * as fs from "fs";
import matter from "gray-matter";
import { pagesCollectionId } from "src/scripts/webflow/webflowIds";
import * as pageSync from "./pageSync";
import * as helpers from "./helpers";
import * as methods from "./methods";
import { WebflowPageFieldData, WebflowItem } from "./types";

const { pageToWebflowFormat, getCurrentWebflowPages, loadAllPagesFromNavigator, updatePages } =
  pageSync;

jest.mock("./helpers", () => ({
  resolveApiPromises: jest.fn().mockResolvedValue(undefined),
  catchRateLimitErrorAndRetry: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("./methods", () => ({
  getAllItems: jest.fn().mockResolvedValue([]),
  createItem: jest
    .fn()
    .mockResolvedValue({ data: { id: `random-id-${randomInt()}` }, headers: new Headers() }),
  modifyItem: jest.fn().mockResolvedValue({ data: {}, headers: new Headers() }),
  deleteItem: jest.fn().mockResolvedValue({ data: {}, headers: new Headers() }),
}));

jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockReturnValue([]),
  readFileSync: jest.fn().mockReturnValue(""),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.mock("gray-matter", () => {
  return jest.fn(() => ({
    data: {},
    content: "",
  }));
});

const mockedHelpers = helpers as jest.Mocked<typeof helpers>;
const mockedMethods = methods as jest.Mocked<typeof methods>;

const mockedFs = jest.mocked(fs);
const mockedMatter = matter as jest.MockedFunction<typeof matter>;

const generateNavigatorPage = (overrides?: Partial<PageItem>): PageItem => {
  return {
    name: `Page ${randomInt()}`,
    slug: `page-${randomInt()}`,
    webflowId: `webflow-id-${randomInt()}`,
    category: `category-id-${randomInt()}`,
    rank: randomInt() % 100,
    "sub-heading-text": `Sub-heading ${randomInt()}`,
    "heading-1": `Heading 1 ${randomInt()}`,
    "main-text-1": `Main text 1 ${randomInt()}`,
    ...overrides,
  };
};

const generateWebflowPage = (
  overrides?: Partial<WebflowItem<WebflowPageFieldData>>,
): WebflowItem<WebflowPageFieldData> => {
  return {
    id: `page-id-${randomInt()}`,
    fieldData: {
      name: `Page ${randomInt()}`,
      slug: `page-${randomInt()}`,
      category: `category-id-${randomInt()}`,
      rank: randomInt() % 100,
      "sub-heading-text": `Sub-heading ${randomInt()}`,
      "heading-1": `Heading 1 ${randomInt()}`,
      "main-text-1": `<p>Main text 1 ${randomInt()}</p>`,
    },
    ...overrides,
  };
};

describe("pageSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("pageToWebflowFormat", () => {
    it("should convert navigator page to Webflow format with required fields", () => {
      const navigatorPage = generateNavigatorPage();

      const result = pageToWebflowFormat(navigatorPage);

      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("slug");
      expect(result).toHaveProperty("category");
      expect(result).not.toHaveProperty("webflowId");
    });

    it("should convert markdown to HTML for main-text fields", () => {
      const navigatorPage = generateNavigatorPage({
        "main-text-1": "# Heading\n\nParagraph text",
      });

      const result = pageToWebflowFormat(navigatorPage);

      expect(result["main-text-1"]).toContain("<h1");
      expect(result["main-text-1"]).toContain("Heading");
    });

    it("should handle link fields as objects with url property", () => {
      const navigatorPage = generateNavigatorPage({
        "link-1": "https://example.com",
      });

      const result = pageToWebflowFormat(navigatorPage);

      expect(result["link-1"]).toEqual({ url: "https://example.com" });
    });

    it("should preserve boolean fields", () => {
      const navigatorPage = generateNavigatorPage({
        "coming-soon": true,
        "navigator-button": false,
      });

      const result = pageToWebflowFormat(navigatorPage);

      expect(result["coming-soon"]).toBe(true);
      expect(result["navigator-button"]).toBe(false);
    });
  });

  describe("getCurrentWebflowPages", () => {
    it("should fetch pages from Webflow", async () => {
      const mockPages = [generateWebflowPage(), generateWebflowPage()];
      mockedMethods.getAllItems.mockResolvedValue(mockPages);

      const result = await getCurrentWebflowPages();

      expect(mockedMethods.getAllItems).toHaveBeenCalledWith(pagesCollectionId);
      expect(result).toEqual(mockPages);
    });
  });

  describe("loadAllPagesFromNavigator", () => {
    it("should load pages from markdown files", () => {
      const mockPages = ["page-1.md", "page-2.md"];
      mockedFs.readdirSync.mockReturnValue(mockPages as any);
      mockedMatter.mockReturnValue({
        data: {
          name: "Page 1",
          slug: "page-1",
          category: "cat-1",
        },
        content: "## Section 1\n\nContent here",
      } as any);

      const result = loadAllPagesFromNavigator();

      expect(mockedFs.readdirSync).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it("should return empty array if pages directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = loadAllPagesFromNavigator();

      expect(result).toEqual([]);
    });
  });

  describe("updatePages", () => {
    it("should update overlapping pages in Webflow", async () => {
      const webflowPage = generateWebflowPage({ id: "webflow-1" });
      const navigatorPage = generateNavigatorPage({ webflowId: "webflow-1" });

      mockedMethods.getAllItems.mockResolvedValue([webflowPage]);
      mockedHelpers.resolveApiPromises.mockImplementation(async (promises) => {
        for (const promise of promises) {
          await promise();
        }
      });

      await updatePages([navigatorPage]);

      expect(mockedMethods.modifyItem).toHaveBeenCalledWith(
        "webflow-1",
        pagesCollectionId,
        expect.any(Object),
      );
    });

    it("should not update pages that are not in navigator", async () => {
      const webflowPage = generateWebflowPage({ id: "webflow-1" });
      const navigatorPage = generateNavigatorPage({ webflowId: "webflow-2" });

      mockedMethods.getAllItems.mockResolvedValue([webflowPage]);

      await updatePages([navigatorPage]);

      expect(mockedMethods.modifyItem).not.toHaveBeenCalled();
    });
  });
});
