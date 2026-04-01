/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { FaqItem } from "@businessnjgovnavigator/shared/types";
import * as fs from "fs";
import matter from "gray-matter";
import { faqCollectionId } from "src/scripts/webflow/webflowIds";
import * as faqSync from "./faqSync";
import * as helpers from "./helpers";
import * as methods from "./methods";
import { WebflowFaqFieldData, WebflowItem } from "./types";

const {
  categoryMap,
  createNewFaqs,
  deleteFaqs,
  faqToWebflowFormat,
  getCategoryIdBySlug,
  getCategorySlugById,
  getCurrentWebflowFaqs,
  getNewFaqs,
  getSubCategoryIdBySlug,
  getSubCategorySlugById,
  getUnusedFaqs,
  subCategoryMap,
  updateFaqs,
} = faqSync;

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

const generateNavigatorFaq = (overrides?: Partial<FaqItem>): FaqItem => {
  return {
    name: `FAQ ${randomInt()}`,
    slug: `faq-${randomInt()}`,
    body: `Content ${randomInt()}`,
    category: categoryMap[randomInt() % categoryMap.length].slug,
    "sub-category": subCategoryMap[randomInt() % subCategoryMap.length].slug,
    author: `author-${randomInt()}`,
    webflowId: `webflow-id-${randomInt()}`,
    ...overrides,
  };
};

const generateWebflowFaq = (
  overrides?: Partial<WebflowItem<WebflowFaqFieldData>>,
): WebflowItem<WebflowFaqFieldData> => {
  return {
    id: `faq-id-${randomInt()}`,
    fieldData: {
      name: `FAQ ${randomInt()}`,
      slug: `faq-${randomInt()}`,
      "support-post": `<p>Content ${randomInt()}</p>`,
      category: categoryMap[randomInt() % categoryMap.length].id,
      "sub-category": subCategoryMap[randomInt() % subCategoryMap.length].id,
      author: `author-${randomInt()}`,
    },
    ...overrides,
  };
};

describe("faqSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCategoryId", () => {
    it.each([
      [categoryMap[0].slug, categoryMap[0].id],
      [categoryMap[1].slug, categoryMap[1].id],
      [categoryMap[2].slug, categoryMap[2].id],
      [categoryMap[3].slug, categoryMap[3].id],
      [categoryMap[4].slug, categoryMap[4].id],
      [categoryMap[5].slug, categoryMap[5].id],
    ])("should return the correct category ID for %s", (slug, expectedId) => {
      expect(getCategoryIdBySlug(slug)).toBe(expectedId);
    });

    it("should return undefined for invalid slug", () => {
      expect(getCategoryIdBySlug("invalid-slug")).toBeUndefined();
    });

    it("should return undefined for undefined slug", () => {
      expect(getCategoryIdBySlug(undefined)).toBeUndefined();
    });
  });

  describe("getSubCategoryId", () => {
    it.each([
      [subCategoryMap[0].slug, subCategoryMap[0].id],
      [subCategoryMap[1].slug, subCategoryMap[1].id],
      [subCategoryMap[2].slug, subCategoryMap[2].id],
      [subCategoryMap[3].slug, subCategoryMap[3].id],
      [subCategoryMap[4].slug, subCategoryMap[4].id],
      [subCategoryMap[5].slug, subCategoryMap[5].id],
      [subCategoryMap[6].slug, subCategoryMap[6].id],
      [subCategoryMap[7].slug, subCategoryMap[7].id],
      [subCategoryMap[8].slug, subCategoryMap[8].id],
      [subCategoryMap[9].slug, subCategoryMap[9].id],
      [subCategoryMap[10].slug, subCategoryMap[10].id],
    ])("should return the correct subcategory ID for %s", (slug, expectedId) => {
      expect(getSubCategoryIdBySlug(slug)).toBe(expectedId);
    });

    it("should return undefined for invalid slug", () => {
      expect(getSubCategoryIdBySlug("invalid-slug")).toBeUndefined();
    });

    it("should return undefined for undefined slug", () => {
      expect(getSubCategoryIdBySlug(undefined)).toBeUndefined();
    });
  });

  describe("getCategorySlugById", () => {
    it.each([
      [categoryMap[0].id, categoryMap[0].slug],
      [categoryMap[1].id, categoryMap[1].slug],
      [categoryMap[2].id, categoryMap[2].slug],
      [categoryMap[3].id, categoryMap[3].slug],
      [categoryMap[4].id, categoryMap[4].slug],
      [categoryMap[5].id, categoryMap[5].slug],
    ])("should return the correct slug for category ID %s", (id, expectedSlug) => {
      expect(getCategorySlugById(id)).toBe(expectedSlug);
    });

    it("should return undefined for invalid ID", () => {
      expect(getCategorySlugById("invalid-id")).toBeUndefined();
    });

    it("should return undefined for undefined ID", () => {
      expect(getCategorySlugById(undefined)).toBeUndefined();
    });
  });

  describe("getSubCategorySlugById", () => {
    it.each([
      [subCategoryMap[0].id, subCategoryMap[0].slug],
      [subCategoryMap[1].id, subCategoryMap[1].slug],
      [subCategoryMap[2].id, subCategoryMap[2].slug],
      [subCategoryMap[3].id, subCategoryMap[3].slug],
      [subCategoryMap[4].id, subCategoryMap[4].slug],
      [subCategoryMap[5].id, subCategoryMap[5].slug],
      [subCategoryMap[6].id, subCategoryMap[6].slug],
      [subCategoryMap[7].id, subCategoryMap[7].slug],
      [subCategoryMap[8].id, subCategoryMap[8].slug],
      [subCategoryMap[9].id, subCategoryMap[9].slug],
      [subCategoryMap[10].id, subCategoryMap[10].slug],
    ])("should return the correct slug for subcategory ID %s", (id, expectedSlug) => {
      expect(getSubCategorySlugById(id)).toBe(expectedSlug);
    });

    it("should return undefined for invalid ID", () => {
      expect(getSubCategorySlugById("invalid-id")).toBeUndefined();
    });

    it("should return undefined for undefined ID", () => {
      expect(getSubCategorySlugById(undefined)).toBeUndefined();
    });
  });

  describe("faqToWebflowFormat", () => {
    it("should convert navigator FAQ to Webflow format", () => {
      const navigatorFaq = generateNavigatorFaq();

      const result = faqToWebflowFormat(navigatorFaq);

      expect(result).toEqual({
        name: navigatorFaq.name,
        slug: navigatorFaq.slug,
        "support-post": navigatorFaq.body,
        category: getCategoryIdBySlug(navigatorFaq.category),
        "sub-category": getSubCategoryIdBySlug(navigatorFaq["sub-category"]),
        author: navigatorFaq.author,
      });
    });

    it("should set missing optional fields to undefined", () => {
      const navigatorFaq = generateNavigatorFaq({
        category: undefined,
        "sub-category": undefined,
        author: undefined,
      });

      const result = faqToWebflowFormat(navigatorFaq);

      expect(result).toEqual({
        name: navigatorFaq.name,
        slug: navigatorFaq.slug,
        "support-post": navigatorFaq.body,
        category: undefined,
        "sub-category": undefined,
        author: undefined,
      });
    });
  });

  describe("getCurrentWebflowFaqs", () => {
    it("should fetch all FAQs from Webflow", async () => {
      const mockFaqs = [generateWebflowFaq(), generateWebflowFaq()];
      mockedMethods.getAllItems.mockResolvedValue(mockFaqs);

      const result = await getCurrentWebflowFaqs();

      expect(result).toEqual(mockFaqs);
      expect(mockedMethods.getAllItems).toHaveBeenCalledWith(faqCollectionId);
    });
  });

  describe("getNewFaqs", () => {
    it("should return FAQs that are in Navigator but not in Webflow (e.g. no webflowId)", async () => {
      const newFaq = generateNavigatorFaq({ webflowId: undefined });
      const existingFaq = generateNavigatorFaq();
      const navigatorFaqs = [newFaq, existingFaq];

      const webflowFaqs = [generateWebflowFaq({ id: existingFaq.webflowId })];

      mockedMethods.getAllItems.mockResolvedValue(webflowFaqs);

      const result = await getNewFaqs(navigatorFaqs);

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe(newFaq.slug);
    });
  });

  describe("getUnusedFaqs", () => {
    it("should return FAQs that are in Webflow but not in Navigator", async () => {
      const existingFaq = generateNavigatorFaq({ webflowId: "existing-id" });
      const navigatorFaqs = [existingFaq];

      const webflowFaqs = [
        generateWebflowFaq({ id: "existing-id" }),
        generateWebflowFaq({ id: "unused-id" }),
      ];

      mockedMethods.getAllItems.mockResolvedValue(webflowFaqs);

      const result = await getUnusedFaqs(navigatorFaqs);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("unused-id");
    });
  });

  describe("deleteFaqs", () => {
    it("should delete FAQs that are no longer in Navigator", async () => {
      const navigatorFaqs = [generateNavigatorFaq()];

      const webflowFaqs = [generateWebflowFaq({ id: "unused-id" })];

      mockedMethods.getAllItems.mockResolvedValue(webflowFaqs);
      mockedHelpers.resolveApiPromises.mockImplementation(async (promises) => {
        for (const promiseFn of promises) {
          await promiseFn();
        }
      });

      await deleteFaqs(navigatorFaqs);

      expect(mockedMethods.deleteItem).toHaveBeenCalledWith("unused-id", faqCollectionId);
    });
  });

  describe("updateFaqs", () => {
    it("should update existing FAQs in Webflow using webflowId", async () => {
      const navigatorFaqs = [generateNavigatorFaq()];

      const webflowFaqs = [generateWebflowFaq({ id: navigatorFaqs[0].webflowId })];

      mockedMethods.getAllItems.mockResolvedValue(webflowFaqs);
      mockedHelpers.resolveApiPromises.mockImplementation(async (promises) => {
        for (const promiseFn of promises) {
          await promiseFn();
        }
      });

      await updateFaqs(navigatorFaqs);

      expect(mockedMethods.modifyItem).toHaveBeenCalledWith(
        navigatorFaqs[0].webflowId,
        faqCollectionId,
        expect.objectContaining({
          name: navigatorFaqs[0].name,
          slug: navigatorFaqs[0].slug,
          "support-post": navigatorFaqs[0].body,
        }),
      );
    });
  });

  describe("createNewFaqs", () => {
    it("should create new FAQs in Webflow and update source markdown files with webflowId", async () => {
      const newFaq = generateNavigatorFaq({
        webflowId: undefined,
      });
      const navigatorFaqs = [newFaq];
      const newWebflowId = `webflow-id-${randomInt()}`;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue("---\nname: test\n---\ncontent");
      mockedMatter.mockReturnValue({
        data: { name: newFaq.name },
        content: "content",
        orig: Buffer.from(""),
        language: "",
        matter: "",
        stringify: () => "",
      });

      mockedMethods.getAllItems.mockResolvedValue([]);
      mockedMethods.createItem.mockResolvedValue({
        data: {
          id: newWebflowId,
          lastPublished: "2026-03-27",
          lastUpdated: "2026-03-27",
          createdOn: "2026-03-27",
          cmsLocaleId: "EN",
          isArchived: false,
          isDraft: false,
          fieldData: {},
        },
        headers: new Headers(),
      });
      mockedHelpers.resolveApiPromises.mockImplementation(async (promises) => {
        for (const promiseFn of promises) {
          await promiseFn();
        }
      });

      await createNewFaqs(navigatorFaqs);

      expect(mockedMethods.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: newFaq.name,
          slug: newFaq.slug,
        }),
        faqCollectionId,
        false,
      );

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(`${newFaq.slug}.md`),
        expect.stringContaining(newWebflowId),
        "utf8",
      );
    });
  });
});
