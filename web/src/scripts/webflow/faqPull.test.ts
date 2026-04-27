/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { FaqItem } from "@businessnjgovnavigator/shared/types";
import * as fs from "fs";
import matter from "gray-matter";
import { faqCollectionId } from "src/scripts/webflow/webflowIds";
import * as faqPull from "./faqPull";
import * as methods from "./methods";
import { WebflowFaqFieldData, WebflowItem } from "./types";

const {
  getCurrentWebflowFaqs,
  loadAllFaqsFromNavigator,
  loadSubCategoryMap,
  pullFaqs,
  webflowFaqToNavigatorFormat,
  writeFaqFile,
} = faqPull;

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
    (body: string, data: Record<string, unknown>) => `---\n${JSON.stringify(data)}\n---\n${body}`,
  );
  return mockMatter;
});

const mockedMethods = methods as jest.Mocked<typeof methods>;
const mockedFs = jest.mocked(fs);
const mockedMatter = matter as jest.MockedFunction<typeof matter>;

const generateWebflowFaq = (
  overrides?: Partial<WebflowItem<WebflowFaqFieldData>>,
): WebflowItem<WebflowFaqFieldData> => ({
  id: `faq-id-${randomInt()}`,
  fieldData: {
    name: `FAQ ${randomInt()}`,
    slug: `faq-${randomInt()}`,
    "support-post": "<p>Some content</p>",
    category: "acd272aef61b78c5513c956a7ff19aa7", // plan-a-business
  },
  ...overrides,
});

describe("faqPull", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadAllFaqsFromNavigator", () => {
    it("should return empty array when directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = loadAllFaqsFromNavigator();

      expect(result).toEqual([]);
    });

    it("should load FAQs from markdown files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["how-do-i-register.md"] as any);

      mockedMatter.mockReturnValueOnce({
        data: {
          name: "How do I register?",
          slug: "how-do-i-register",
          webflowId: "abc123",
          category: "start-a-business",
          "sub-category": "registering-a-business",
        },
        content: "Some body content",
      } as any);

      const result = loadAllFaqsFromNavigator();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("How do I register?");
      expect(result[0].category).toBe("start-a-business");
      expect(result[0]["sub-category"]).toBe("registering-a-business");
      expect(result[0].body).toBe("Some body content");
    });

    it("should filter out non-markdown files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["faq.md", "image.png", "notes.txt"] as any);
      mockedMatter.mockReturnValue({ data: { name: "FAQ", slug: "faq" }, content: "" } as any);

      loadAllFaqsFromNavigator();

      expect(mockedMatter).toHaveBeenCalledTimes(1);
    });
  });

  describe("loadSubCategoryMap", () => {
    it("should return empty map when directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = loadSubCategoryMap();

      expect(result.size).toBe(0);
    });

    it("should build a webflowId-to-slug map from JSON files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["starting-a-business.json"] as any);
      mockedFs.readFileSync.mockReturnValue(
        JSON.stringify({
          name: "Starting a Business",
          slug: "starting-a-business",
          webflowId: "fd312407834965b77ee1a8a85e1d3c2c",
        }) as any,
      );

      const result = loadSubCategoryMap();

      expect(result.get("fd312407834965b77ee1a8a85e1d3c2c")).toBe("starting-a-business");
    });
  });

  describe("getCurrentWebflowFaqs", () => {
    it("should call getAllItems with the FAQ collection ID", async () => {
      await getCurrentWebflowFaqs();

      expect(mockedMethods.getAllItems).toHaveBeenCalledWith(faqCollectionId);
    });
  });

  describe("webflowFaqToNavigatorFormat", () => {
    const subCategoryMap = new Map([["fd312407834965b77ee1a8a85e1d3c2c", "starting-a-business"]]);

    it("should map all fields correctly", () => {
      const item = generateWebflowFaq({
        id: "webflow-id-123",
        fieldData: {
          name: "Test FAQ",
          slug: "test-faq",
          "support-post": "<p>Body</p>",
          category: "acd272aef61b78c5513c956a7ff19aa7",
          "sub-category": "fd312407834965b77ee1a8a85e1d3c2c",
        },
      });

      const result = webflowFaqToNavigatorFormat(item, subCategoryMap);

      expect(result.name).toBe("Test FAQ");
      expect(result.slug).toBe("test-faq");
      expect(result.webflowId).toBe("webflow-id-123");
      expect(result.category).toBe("plan-a-business");
      expect(result["sub-category"]).toBe("starting-a-business");
    });

    it("should normalize smart quotes in name", () => {
      const item = generateWebflowFaq({
        fieldData: {
          name: "JP\u2019s Business?",
          slug: "test",
          "support-post": "",
        },
      });

      const result = webflowFaqToNavigatorFormat(item, subCategoryMap);

      expect(result.name).toBe("JP's Business?");
    });

    it("should warn and omit category when option ID is unrecognized", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const item = generateWebflowFaq({
        fieldData: {
          name: "Test FAQ",
          slug: "test",
          "support-post": "",
          category: "unknown-option-id",
        },
      });

      const result = webflowFaqToNavigatorFormat(item, subCategoryMap);

      expect(result.category).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unknown category option ID"),
      );
      consoleSpy.mockRestore();
    });

    it("should warn and omit sub-category when option ID is unrecognized", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const item = generateWebflowFaq({
        fieldData: {
          name: "Test FAQ",
          slug: "test",
          "support-post": "",
          "sub-category": "unknown-sub-id",
        },
      });

      const result = webflowFaqToNavigatorFormat(item, new Map());

      expect(result["sub-category"]).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unknown sub-category option ID"),
      );
      consoleSpy.mockRestore();
    });

    it("should handle missing category and sub-category gracefully", () => {
      const item = generateWebflowFaq({
        fieldData: { name: "No Category FAQ", slug: "no-cat", "support-post": "<p>Body</p>" },
      });

      const result = webflowFaqToNavigatorFormat(item, subCategoryMap);

      expect(result.category).toBeUndefined();
      expect(result["sub-category"]).toBeUndefined();
    });
  });

  describe("writeFaqFile", () => {
    it("should write a file at {slug}.md", () => {
      const faq: FaqItem = {
        name: "How do I register?",
        slug: "how-do-i-register",
        webflowId: "abc123",
        category: "start-a-business",
        body: "Some content",
      };

      writeFaqFile(faq);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("how-do-i-register.md"),
        expect.any(String),
        "utf8",
      );
    });

    it("should create the directory if it does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      writeFaqFile({ name: "FAQ", slug: "faq", webflowId: "id", body: "" });

      expect(mockedFs.mkdirSync).toHaveBeenCalled();
    });

    it("should not include sub-category in frontmatter if undefined", () => {
      const faq: FaqItem = {
        name: "Test",
        slug: "test",
        webflowId: "id",
        body: "",
      };

      writeFaqFile(faq);

      const writtenContent = (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1] as string;
      expect(writtenContent).not.toContain("sub-category");
    });
  });

  describe("pullFaqs", () => {
    it("should write a file for each FAQ in Webflow", async () => {
      const webflowFaqs = [generateWebflowFaq(), generateWebflowFaq()];
      mockedMethods.getAllItems.mockResolvedValue(webflowFaqs);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullFaqs();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it("should update existing FAQs matched by webflowId", async () => {
      const existingId = "existing-faq-id";
      const webflowFaq = generateWebflowFaq({ id: existingId });
      mockedMethods.getAllItems.mockResolvedValue([webflowFaq]);

      mockedFs.readdirSync.mockReturnValue(["existing.md"] as any);
      mockedMatter.mockReturnValue({
        data: { name: "Existing", slug: "existing", webflowId: existingId },
        content: "",
      } as any);

      await pullFaqs();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it("should create new files for FAQs not found in Navigator", async () => {
      const newFaq = generateWebflowFaq({ id: "brand-new-id" });
      mockedMethods.getAllItems.mockResolvedValue([newFaq]);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullFaqs();

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${newFaq.fieldData.slug}.md`),
        expect.any(String),
        "utf8",
      );
    });
  });
});
