/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { RecentItem } from "@businessnjgovnavigator/shared/types";
import * as fs from "fs";
import matter from "gray-matter";
import { recentsCollectionId } from "src/scripts/webflow/webflowIds";
import * as methods from "./methods";
import * as recentPull from "./recentPull";
import { WebflowItem, WebflowRecentFieldData } from "./types";

const {
  agencyOptionMap,
  getCurrentWebflowRecents,
  loadAllRecentsFromNavigator,
  pullRecents,
  topicsOptionMap,
  webflowRecentToNavigatorFormat,
  writeRecentFile,
} = recentPull;

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

const generateWebflowRecent = (
  overrides?: Partial<WebflowItem<WebflowRecentFieldData>>,
): WebflowItem<WebflowRecentFieldData> => ({
  id: `recent-id-${randomInt()}`,
  fieldData: {
    name: `Recent ${randomInt()}`,
    slug: `recent-${randomInt()}`,
  },
  ...overrides,
});

describe("recentPull", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("topicsOptionMap", () => {
    it("should map 2 known topics option IDs", () => {
      expect(Object.keys(topicsOptionMap)).toHaveLength(2);
      expect(topicsOptionMap["08c49828a417b6978ad2978d697087da"]).toBe("Grants and Resources");
      expect(topicsOptionMap["373d83f11a87e04cff19382a52874620"]).toBe("Rules and Regulations");
    });
  });

  describe("agencyOptionMap", () => {
    it("should map all 7 known agency option IDs", () => {
      expect(Object.keys(agencyOptionMap)).toHaveLength(7);
      expect(agencyOptionMap["f04e1bc5be41746fccb656fb9d50fdbc"]).toBe("NJ Business Action Center");
    });
  });

  describe("loadAllRecentsFromNavigator", () => {
    it("should return empty array when directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      expect(loadAllRecentsFromNavigator()).toEqual([]);
    });

    it("should load recents from markdown files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["article.md"] as any);
      const recentData = { name: "Article", slug: "article", webflowId: "id-1" };
      mockedMatter.mockReturnValue({ data: recentData, content: "Body content" } as any);

      const result = loadAllRecentsFromNavigator();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Article");
      expect(result[0].body).toBe("Body content");
    });
  });

  describe("getCurrentWebflowRecents", () => {
    it("should call getAllItems with the recents collection ID", async () => {
      await getCurrentWebflowRecents();
      expect(mockedMethods.getAllItems).toHaveBeenCalledWith(recentsCollectionId);
    });
  });

  describe("webflowRecentToNavigatorFormat", () => {
    it("should map core fields correctly", () => {
      const item = generateWebflowRecent({
        id: "wf-id-123",
        fieldData: {
          name: "Test Article",
          slug: "test-article",
          "updated-on-date": "2026-03-26T00:00:00.000Z",
          "cta-text": "Read More",
          "cta-link": "https://example.com",
          "section-1": "<p>Body content</p>",
        },
      });

      const result = webflowRecentToNavigatorFormat(item);

      expect(result.name).toBe("Test Article");
      expect(result.slug).toBe("test-article");
      expect(result.webflowId).toBe("wf-id-123");
      expect(result.date).toBe("2026-03-26");
      expect(result["cta-text"]).toBe("Read More");
      expect(result["cta-link"]).toBe("https://example.com");
    });

    it("should map topics option ID to readable name", () => {
      const item = generateWebflowRecent({
        fieldData: {
          name: "Test",
          slug: "test",
          topics: "08c49828a417b6978ad2978d697087da",
        },
      });

      const result = webflowRecentToNavigatorFormat(item);

      expect(result.topics).toBe("Grants and Resources");
    });

    it("should map agency option ID to readable name", () => {
      const item = generateWebflowRecent({
        fieldData: {
          name: "Test",
          slug: "test",
          agency: "f04e1bc5be41746fccb656fb9d50fdbc",
        },
      });

      const result = webflowRecentToNavigatorFormat(item);

      expect(result.agency).toBe("NJ Business Action Center");
    });

    it("should warn and omit topics when option ID is unrecognized", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const item = generateWebflowRecent({
        fieldData: { name: "Test", slug: "test", topics: "unknown-id" },
      });

      const result = webflowRecentToNavigatorFormat(item);

      expect(result.topics).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown topics option ID"));
      consoleSpy.mockRestore();
    });

    it("should strip time from date", () => {
      const item = generateWebflowRecent({
        fieldData: {
          name: "Test",
          slug: "test",
          "updated-on-date": "2024-06-15T12:30:00.000Z",
        },
      });

      const result = webflowRecentToNavigatorFormat(item);

      expect(result.date).toBe("2024-06-15");
    });

    it("should convert source HTML to markdown", () => {
      const item = generateWebflowRecent({
        fieldData: { name: "Test", slug: "test", source: "<p>source content</p>" },
      });

      const result = webflowRecentToNavigatorFormat(item);

      expect(result.source).toBe("<p>source content</p>");
    });

    it("should use section-1 as body", () => {
      const item = generateWebflowRecent({
        fieldData: { name: "Test", slug: "test", "section-1": "<p>Article body</p>" },
      });

      const result = webflowRecentToNavigatorFormat(item);

      expect(result.body).toBe("<p>Article body</p>");
    });
  });

  describe("writeRecentFile", () => {
    it("should write a file at {slug}.md", () => {
      const recent: RecentItem = { name: "Test", slug: "test", webflowId: "id", body: "" };
      writeRecentFile(recent);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("test.md"),
        expect.any(String),
        "utf8",
      );
    });

    it("should create the directory if it does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      writeRecentFile({ name: "Test", slug: "test", webflowId: "id", body: "" });

      expect(mockedFs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe("pullRecents", () => {
    it("should write a file for each recent in Webflow", async () => {
      const webflowRecents = [generateWebflowRecent(), generateWebflowRecent()];
      mockedMethods.getAllItems.mockResolvedValue(webflowRecents);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullRecents();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it("should update existing recents matched by webflowId", async () => {
      const existingId = "existing-recent-id";
      const webflowRecent = generateWebflowRecent({ id: existingId });
      mockedMethods.getAllItems.mockResolvedValue([webflowRecent]);

      mockedFs.readdirSync.mockReturnValue(["existing.md"] as any);
      mockedMatter.mockReturnValue({
        data: { name: "Existing", slug: "existing", webflowId: existingId },
        content: "",
      } as any);

      await pullRecents();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it("should create new files for recents not found in Navigator", async () => {
      const newRecent = generateWebflowRecent({ id: "brand-new-id" });
      mockedMethods.getAllItems.mockResolvedValue([newRecent]);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullRecents();

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${newRecent.fieldData.slug}.md`),
        expect.any(String),
        "utf8",
      );
    });
  });
});
