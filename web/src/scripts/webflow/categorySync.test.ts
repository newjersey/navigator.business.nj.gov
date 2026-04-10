/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { CategoryItem } from "@businessnjgovnavigator/shared/types";
import * as fs from "fs";
import matter from "gray-matter";
import { categoriesCollectionId } from "src/scripts/webflow/webflowIds";
import * as categorySync from "./categorySync";
import * as helpers from "./helpers";
import * as methods from "./methods";
import { WebflowCategoryFieldData, WebflowItem } from "./types";

const {
  categoryToWebflowFormat,
  createNewCategories,
  deleteCategories,
  getCurrentWebflowCategories,
  getNewCategories,
  getUnusedCategories,
  loadAllCategoriesFromNavigator,
  updateCategories,
} = categorySync;

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

const generateNavigatorCategory = (overrides?: Partial<CategoryItem>): CategoryItem => {
  return {
    name: `Category ${randomInt()}`,
    slug: `category-${randomInt()}`,
    webflowId: `webflow-id-${randomInt()}`,
    "nav-name": `Nav ${randomInt()}`,
    "description-text": `Description ${randomInt()}`,
    "navbar-order": randomInt() % 10,
    "topic-color": `#${randomInt().toString(16).slice(0, 6)}`,
    "topic-description": `Topic description ${randomInt()}`,
    "homepage-description": `Homepage description ${randomInt()}`,
    ...overrides,
  };
};

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
      "navbar-order": randomInt() % 10,
      "topic-color": `#${randomInt().toString(16).slice(0, 6)}`,
      "topic-description": `Topic description ${randomInt()}`,
      "homepage-description": `Homepage description ${randomInt()}`,
    },
    ...overrides,
  };
};

describe("categorySync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("categoryToWebflowFormat", () => {
    it("should convert navigator category to Webflow format with all fields excluding webflowId", () => {
      const navigatorCategory = generateNavigatorCategory();

      const result = categoryToWebflowFormat(navigatorCategory);

      expect(result).not.toHaveProperty("webflowId");
      expect(result).toEqual({ ...navigatorCategory, webflowId: undefined });
    });

    it("should exclude undefined fields from Webflow format", () => {
      const navigatorCategory: CategoryItem = {
        name: "Minimal Category",
        slug: "minimal",
      };

      const result = categoryToWebflowFormat(navigatorCategory);

      expect(result).toEqual({
        name: "Minimal Category",
        slug: "minimal",
      });
      expect(result).not.toHaveProperty("nav-name");
      expect(result).not.toHaveProperty("description-text");
    });

    it("should include all optional fields when present", () => {
      const navigatorCategory = generateNavigatorCategory({
        "bg-image": "https://example.com/bg.svg",
        "topic-icon": "https://example.com/icon.svg",
        "mobile-icon": "https://example.com/mobile.svg",
        "topic-icon-white-bg": "https://example.com/white-bg.svg",
        "topic-icon-cat-page": "https://example.com/cat-page.svg",
        arrow: "https://example.com/arrow.svg",
        "navigator-promotion-image": "https://example.com/promo.png",
        "icon-accessibility-alt-description": "Alt text",
        "navigation-promotion-color": "#f9f7fb",
        "navigation-tile-border-color": "#dacee4",
        "nav-promo-text-color-2": "#422d53",
        "category-page-tile-background": "#f9f7fb",
        "category-page-header": "#835daf",
        "category-page-promo-text": "#5c3f74",
        "side-nav-hover-color": "#ece6f2",
        "side-nav-background-color": "#f9f7fb",
        "side-nav-active-color": "#835da4",
      });

      const result = categoryToWebflowFormat(navigatorCategory);

      expect(result["bg-image"]).toBe("https://example.com/bg.svg");
      expect(result["topic-icon"]).toBe("https://example.com/icon.svg");
      expect(result["navigation-promotion-color"]).toBe("#f9f7fb");
      expect(result["side-nav-active-color"]).toBe("#835da4");
    });
  });

  describe("loadAllCategoriesFromNavigator", () => {
    it("should return empty array if categories directory does not exist", () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = loadAllCategoriesFromNavigator();

      expect(result).toEqual([]);
    });

    it("should load categories from markdown files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["plan.md", "start.md"] as any);

      const planData = {
        name: "Plan a Business",
        slug: "plan",
        webflowId: "webflow-id-1",
        "nav-name": "Plan",
      };

      const startData = {
        name: "Start a Business",
        slug: "start",
        webflowId: "webflow-id-2",
        "nav-name": "Start",
      };

      mockedMatter
        .mockReturnValueOnce({ data: planData, content: "" } as any)
        .mockReturnValueOnce({ data: startData, content: "" } as any);

      const result = loadAllCategoriesFromNavigator();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(planData);
      expect(result[1]).toEqual(startData);
    });

    it("should filter out non-markdown files", () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(["plan.md", "images", "README.txt", "grow.md"] as any);

      mockedMatter.mockReturnValue({ data: {}, content: "" } as any);

      loadAllCategoriesFromNavigator();

      expect(mockedMatter).toHaveBeenCalledTimes(2); // Only .md files
    });
  });

  describe("getNewCategories", () => {
    it("should return categories without webflowId", async () => {
      const categoryWithId = generateNavigatorCategory({ webflowId: "existing-id" });
      const categoryWithoutId = generateNavigatorCategory({ webflowId: undefined });

      const result = await getNewCategories([categoryWithId, categoryWithoutId]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(categoryWithoutId);
    });

    it("should return empty array if all categories have webflowId", async () => {
      const categories = [
        generateNavigatorCategory({ webflowId: "id-1" }),
        generateNavigatorCategory({ webflowId: "id-2" }),
      ];

      const result = await getNewCategories(categories);

      expect(result).toEqual([]);
    });

    it("should return all categories if none have webflowId", async () => {
      const categories = [
        generateNavigatorCategory({ webflowId: undefined }),
        generateNavigatorCategory({ webflowId: undefined }),
      ];

      const result = await getNewCategories(categories);

      expect(result).toHaveLength(2);
    });
  });

  describe("getUnusedCategories", () => {
    it("should return Webflow categories not in Navigator", async () => {
      const webflowCategory1 = generateWebflowCategory({ id: "webflow-1" });
      const webflowCategory2 = generateWebflowCategory({ id: "webflow-2" });
      const webflowCategory3 = generateWebflowCategory({ id: "webflow-3" });

      mockedMethods.getAllItems.mockResolvedValue([
        webflowCategory1,
        webflowCategory2,
        webflowCategory3,
      ]);

      const navigatorCategories = [
        generateNavigatorCategory({ webflowId: "webflow-1" }),
        generateNavigatorCategory({ webflowId: "webflow-2" }),
      ];

      const result = await getUnusedCategories(navigatorCategories);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("webflow-3");
    });

    it("should return empty array if all Webflow categories are in Navigator", async () => {
      const webflowCategory1 = generateWebflowCategory({ id: "webflow-1" });
      const webflowCategory2 = generateWebflowCategory({ id: "webflow-2" });

      mockedMethods.getAllItems.mockResolvedValue([webflowCategory1, webflowCategory2]);

      const navigatorCategories = [
        generateNavigatorCategory({ webflowId: "webflow-1" }),
        generateNavigatorCategory({ webflowId: "webflow-2" }),
      ];

      const result = await getUnusedCategories(navigatorCategories);

      expect(result).toEqual([]);
    });
  });

  describe("getCurrentWebflowCategories", () => {
    it("should call getAllItems with correct collection ID", async () => {
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

  describe("deleteCategories", () => {
    it("should delete unused categories from Webflow", async () => {
      const unusedCategory = generateWebflowCategory({ id: "unused-id" });
      mockedMethods.getAllItems.mockResolvedValue([unusedCategory]);

      const navigatorCategories = [generateNavigatorCategory({ webflowId: "different-id" })];

      await deleteCategories(navigatorCategories);

      expect(mockedHelpers.resolveApiPromises).toHaveBeenCalled();
    });

    it("should not attempt to delete if no unused categories", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      await deleteCategories([generateNavigatorCategory()]);

      const calls = mockedHelpers.resolveApiPromises.mock.calls;
      expect(calls[0][0]).toHaveLength(0); // No delete operations queued
    });
  });

  describe("updateCategories", () => {
    it("should update existing categories in Webflow", async () => {
      const webflowCategory = generateWebflowCategory({ id: "existing-id" });
      mockedMethods.getAllItems.mockResolvedValue([webflowCategory]);

      const navigatorCategory = generateNavigatorCategory({
        webflowId: "existing-id",
        name: "Updated Name",
      });

      await updateCategories([navigatorCategory]);

      expect(mockedHelpers.resolveApiPromises).toHaveBeenCalled();
    });

    it("should not update categories not in Webflow", async () => {
      mockedMethods.getAllItems.mockResolvedValue([]);

      const navigatorCategory = generateNavigatorCategory({ webflowId: "non-existent-id" });

      await updateCategories([navigatorCategory]);

      const calls = mockedHelpers.resolveApiPromises.mock.calls;
      expect(calls[0][0]).toHaveLength(0); // No update operations queued
    });
  });

  describe("createNewCategories", () => {
    it("should create categories without webflowId", async () => {
      const newCategory = generateNavigatorCategory({ webflowId: undefined });

      await createNewCategories([newCategory]);

      expect(mockedHelpers.resolveApiPromises).toHaveBeenCalled();
    });

    it("should not create categories that already have webflowId", async () => {
      const existingCategory = generateNavigatorCategory({ webflowId: "existing-id" });

      await createNewCategories([existingCategory]);

      const calls = mockedHelpers.resolveApiPromises.mock.calls;
      expect(calls[0][0]).toHaveLength(0); // No create operations queued
    });

    it("should update markdown file with webflowId after creation", async () => {
      const newCategory = generateNavigatorCategory({
        webflowId: undefined,
        slug: "new-category",
      });

      const createdId = "newly-created-id";
      mockedMethods.createItem.mockResolvedValue({
        data: { id: createdId },
        headers: new Headers(),
      } as any);

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue("---\nname: Test\nslug: new-category\n---");
      mockedMatter.mockReturnValue({
        data: { name: "Test", slug: "new-category" },
        content: "",
      } as any);

      await createNewCategories([newCategory]);

      // Verify resolveApiPromises was called and execute the create function
      expect(mockedHelpers.resolveApiPromises).toHaveBeenCalled();
      const createFunctions = mockedHelpers.resolveApiPromises.mock.calls[0][0];
      await createFunctions[0](); // Execute the create function

      expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });
  });
});
