/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { CategoryItem } from "@businessnjgovnavigator/shared/types";
import * as fs from "fs";
import { categoriesCollectionId } from "src/scripts/webflow/webflowIds";
import * as categoryPull from "./categoryPull";
import * as methods from "./methods";
import { WebflowCategoryFieldData, WebflowItem } from "./types";

const {
  getCurrentWebflowCategories,
  loadAllCategoriesFromNavigator,
  webflowCategoryToNavigatorFormat,
  writeCategoryFile,
  pullCategories,
} = categoryPull;

jest.mock("./methods", () => ({
  getAllItems: jest.fn().mockResolvedValue([]),
  normalizeQuotes: (text: string): string =>
    text.replaceAll(/[\u2018\u2019]/g, "'").replaceAll(/[\u201C\u201D]/g, '"'),
}));

jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readdirSync: jest.fn().mockReturnValue([]),
  readFileSync: jest.fn().mockReturnValue("{}"),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

const mockedMethods = methods as jest.Mocked<typeof methods>;
const mockedFs = jest.mocked(fs);

const generateWebflowCategory = (
  overrides?: Partial<WebflowItem<WebflowCategoryFieldData>>,
): WebflowItem<WebflowCategoryFieldData> => {
  return {
    id: `category-id-${randomInt()}`,
    fieldData: {
      name: `Category ${randomInt()}`,
      slug: `category-${randomInt()}`,
      "nav-name": `Nav ${randomInt()}`,
      "description-text": `Description ${randomInt()}`,
      "topic-description": `Topic description ${randomInt()}`,
      "homepage-description": `Homepage description ${randomInt()}`,
    },
    ...overrides,
  };
};

describe("categoryPull", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("webflowCategoryToNavigatorFormat", () => {
    it("should map all fields from a Webflow item to a CategoryItem", () => {
      const item = generateWebflowCategory({ id: "webflow-id-123" });

      const result = webflowCategoryToNavigatorFormat(item);

      expect(result.name).toBe(item.fieldData.name);
      expect(result.slug).toBe(item.fieldData.slug);
      expect(result.webflowId).toBe("webflow-id-123");
      expect(result["nav-name"]).toBe(item.fieldData["nav-name"]);
      expect(result["description-text"]).toBe(item.fieldData["description-text"]);
      expect(result["topic-description"]).toBe(item.fieldData["topic-description"]);
      expect(result["homepage-description"]).toBe(item.fieldData["homepage-description"]);
    });

    it("should normalize smart quotes in text fields", () => {
      const item = generateWebflowCategory({
        fieldData: {
          name: "You\u2019ve started",
          slug: "start",
          "description-text": "It\u2019s time to grow",
          "topic-description": "\u201CHello\u201D world",
          "homepage-description": "Don\u2018t stop",
        },
      });

      const result = webflowCategoryToNavigatorFormat(item);

      expect(result.name).toBe("You've started");
      expect(result["description-text"]).toBe("It's time to grow");
      expect(result["topic-description"]).toBe('"Hello" world');
      expect(result["homepage-description"]).toBe("Don't stop");
    });

    it("should omit optional fields when not present in Webflow data", () => {
      const item = generateWebflowCategory({
        fieldData: { name: "Minimal", slug: "minimal" },
      });

      const result = webflowCategoryToNavigatorFormat(item);

      expect(result.name).toBe("Minimal");
      expect(result.slug).toBe("minimal");
      expect(result["nav-name"]).toBeUndefined();
      expect(result["description-text"]).toBeUndefined();
      expect(result["topic-description"]).toBeUndefined();
      expect(result["homepage-description"]).toBeUndefined();
    });
  });

  describe("loadAllCategoriesFromNavigator", () => {
    it("should return empty array if directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = loadAllCategoriesFromNavigator();

      expect(result).toEqual([]);
    });

    it("should load categories from JSON files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["plan.json", "start.json"] as any);

      const planData: CategoryItem = { name: "Plan a Business", slug: "plan", webflowId: "id-1" };
      const startData: CategoryItem = {
        name: "Start a Business",
        slug: "start",
        webflowId: "id-2",
      };

      mockedFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(planData) as any)
        .mockReturnValueOnce(JSON.stringify(startData) as any);

      const result = loadAllCategoriesFromNavigator();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(planData);
      expect(result[1]).toEqual(startData);
    });
  });

  describe("getCurrentWebflowCategories", () => {
    it("should call getAllItems with the correct collection ID", async () => {
      await getCurrentWebflowCategories();

      expect(mockedMethods.getAllItems).toHaveBeenCalledWith(categoriesCollectionId);
    });

    it("should return categories from getAllItems", async () => {
      const mockCategories = [generateWebflowCategory(), generateWebflowCategory()];
      mockedMethods.getAllItems.mockResolvedValue(mockCategories);

      const result = await getCurrentWebflowCategories();

      expect(result).toEqual(mockCategories);
    });
  });

  describe("writeCategoryFile", () => {
    it("should write a file at {slug}.json", () => {
      const category: CategoryItem = {
        name: "Plan a Business",
        slug: "plan",
        webflowId: "webflow-id-1",
        "nav-name": "Plan",
        "description-text": "Description text",
        "topic-description": "Topic description",
        "homepage-description": "Homepage description",
      };

      writeCategoryFile(category);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("plan.json"),
        expect.any(String),
        "utf8",
      );
    });

    it("should create the directory if it does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      const category: CategoryItem = { name: "New", slug: "new", webflowId: "id-1" };

      writeCategoryFile(category);

      expect(mockedFs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe("pullCategories", () => {
    it("should write a file for each category in Webflow", async () => {
      const webflowCategories = [generateWebflowCategory(), generateWebflowCategory()];
      mockedMethods.getAllItems.mockResolvedValue(webflowCategories);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullCategories();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it("should update existing categories matched by webflowId", async () => {
      const existingId = "existing-webflow-id";
      const webflowCategory = generateWebflowCategory({ id: existingId });
      mockedMethods.getAllItems.mockResolvedValue([webflowCategory]);

      mockedFs.readdirSync.mockReturnValue(["plan.json"] as any);
      mockedFs.readFileSync.mockReturnValue(
        JSON.stringify({ name: "Plan", slug: "plan", webflowId: existingId }) as any,
      );

      await pullCategories();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it("should create new files for categories not found in Navigator", async () => {
      const newCategory = generateWebflowCategory({ id: "brand-new-id" });
      mockedMethods.getAllItems.mockResolvedValue([newCategory]);
      mockedFs.readdirSync.mockReturnValue([]);

      await pullCategories();

      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${newCategory.fieldData.slug}.json`),
        expect.any(String),
        "utf8",
      );
    });
  });
});
