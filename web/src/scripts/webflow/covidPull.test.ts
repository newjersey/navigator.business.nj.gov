/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import * as fs from "fs";
import matter from "gray-matter";
import { covidsCollectionId } from "src/scripts/webflow/webflowIds";
import * as covidPull from "./covidPull";
import * as methods from "./methods";
import { WebflowCovidFieldData, WebflowItem } from "./types";

const {
  getCurrentWebflowCovids,
  loadAllCovidsFromNavigator,
  pullCovids,
  topicOptionMap,
  webflowCovidToNavigatorFormat,
  writeCovidFile,
} = covidPull;

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

const generateWebflowCovid = (
  overrides?: Partial<WebflowItem<WebflowCovidFieldData>>,
): WebflowItem<WebflowCovidFieldData> => ({
  id: `covid-id-${randomInt()}`,
  fieldData: {
    name: `COVID Item ${randomInt()}`,
    slug: `covid-${randomInt()}`,
  },
  ...overrides,
});

describe("covidPull", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("topicOptionMap", () => {
    it("should map all 6 known section option IDs", () => {
      expect(Object.keys(topicOptionMap)).toHaveLength(6);
      expect(topicOptionMap["12c69a4cbf582d95f5a0ee641f459041"]).toBe(
        "Business Operation Restrictions",
      );
    });
  });

  describe("loadAllCovidsFromNavigator", () => {
    it("should return empty array when directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      expect(loadAllCovidsFromNavigator()).toEqual([]);
    });

    it("should load covids from markdown files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["article.md"] as any);
      mockedMatter.mockReturnValue({
        data: { name: "Article", slug: "article" },
        content: "",
      } as any);

      const result = loadAllCovidsFromNavigator();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Article");
    });
  });

  describe("getCurrentWebflowCovids", () => {
    it("should call getAllItems with the covids collection ID", async () => {
      await getCurrentWebflowCovids();
      expect(mockedMethods.getAllItems).toHaveBeenCalledWith(covidsCollectionId);
    });
  });

  describe("webflowCovidToNavigatorFormat", () => {
    it("should map core fields correctly", () => {
      const item = generateWebflowCovid({
        id: "wf-id-123",
        fieldData: {
          name: "Test COVID",
          slug: "test-covid",
          section: "12c69a4cbf582d95f5a0ee641f459041",
          source: "<p>Some source</p>",
        },
      });

      const result = webflowCovidToNavigatorFormat(item);

      expect(result.name).toBe("Test COVID");
      expect(result.slug).toBe("test-covid");
      expect(result.webflowId).toBe("wf-id-123");
      expect(result.topic).toBe("Business Operation Restrictions");
      expect(result.source).toBe("<p>Some source</p>");
    });

    it("should convert section content HTML via htmlToMarkdown", () => {
      const item = generateWebflowCovid({
        fieldData: {
          name: "Test",
          slug: "test",
          "s1-headline": "Headline 1",
          "section-1": "<p>Content 1</p>",
        },
      });

      const result = webflowCovidToNavigatorFormat(item);

      expect(result["s1-headline"]).toBe("Headline 1");
      expect(result["section-1"]).toBe("<p>Content 1</p>");
    });

    it("should warn and omit topic when option ID is unrecognized", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const item = generateWebflowCovid({
        fieldData: { name: "Test", slug: "test", section: "unknown-id" },
      });

      const result = webflowCovidToNavigatorFormat(item);

      expect(result.topic).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown topic option ID"));
      consoleSpy.mockRestore();
    });

    it("should apply normalizeQuotes to text fields", () => {
      const item = generateWebflowCovid({
        fieldData: { name: "It\u2019s important", slug: "test" },
      });

      const result = webflowCovidToNavigatorFormat(item);

      expect(result.name).toBe("It's important");
    });
  });

  describe("writeCovidFile", () => {
    it("should write a file at {slug}.md", () => {
      writeCovidFile({ name: "Test", slug: "test", webflowId: "id" });

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("test.md"),
        expect.any(String),
        "utf8",
      );
    });

    it("should create the directory if it does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      writeCovidFile({ name: "Test", slug: "test", webflowId: "id" });

      expect(mockedFs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe("pullCovids", () => {
    it("should write a file for each covid in Webflow", async () => {
      mockedMethods.getAllItems.mockResolvedValue([generateWebflowCovid(), generateWebflowCovid()]);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullCovids();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it("should create new files for covids not found in Navigator", async () => {
      const newCovid = generateWebflowCovid({ id: "brand-new-id" });
      mockedMethods.getAllItems.mockResolvedValue([newCovid]);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullCovids();

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${newCovid.fieldData.slug}.md`),
        expect.any(String),
        "utf8",
      );
    });
  });
});
