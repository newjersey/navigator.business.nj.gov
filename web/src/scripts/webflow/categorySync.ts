import { CategoryItem } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";
import { catchRateLimitErrorAndRetry, resolveApiPromises } from "./helpers";
import { createItem, deleteItem, getAllItems, modifyItem } from "./methods";
import { WebflowCategoryFieldData, WebflowCreateItemResponse, WebflowItem } from "./types";
import { categoriesCollectionId } from "./webflowIds";

const categoriesDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/categories`,
);

const loadAllCategoriesFromNavigator = (): CategoryItem[] => {
  if (!fs.existsSync(categoriesDir)) return [];

  const categoryFiles = fs.readdirSync(categoriesDir).filter((file) => file.endsWith(".md"));

  return categoryFiles.map((file) => {
    const fullPath = path.join(categoriesDir, file);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContent);
    return data as CategoryItem;
  });
};

const getCurrentWebflowCategories = async (): Promise<WebflowItem<WebflowCategoryFieldData>[]> => {
  return await getAllItems<WebflowCategoryFieldData>(categoriesCollectionId);
};

const categoryToWebflowFormat = (category: CategoryItem): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(category).filter(([key, value]) => value !== undefined && key !== "webflowId"),
  );
};

const getOverlappingCategories = (
  currentCategories: WebflowItem<WebflowCategoryFieldData>[],
  navigatorCategories: CategoryItem[],
): WebflowItem<WebflowCategoryFieldData>[] => {
  const categoryWebflowIds = new Set(
    navigatorCategories
      .filter((category) => category.webflowId)
      .map((category) => category.webflowId as string),
  );
  return currentCategories.filter((item) => categoryWebflowIds.has(item.id));
};

const getNewCategories = async (navigatorCategories: CategoryItem[]): Promise<CategoryItem[]> => {
  return navigatorCategories.filter((category) => !category.webflowId);
};

const getUnusedCategories = async (
  navigatorCategories: CategoryItem[],
): Promise<WebflowItem<WebflowCategoryFieldData>[]> => {
  const current = await getCurrentWebflowCategories();
  const categoryWebflowIds = new Set(
    navigatorCategories
      .filter((category) => category.webflowId !== undefined)
      .map((category) => category.webflowId as string),
  );
  return current.filter((item) => !categoryWebflowIds.has(item.id));
};

const deleteCategories = async (navigatorCategories: CategoryItem[]): Promise<void> => {
  const categories = await getUnusedCategories(navigatorCategories);

  const deleteCategory = async (category: WebflowItem<WebflowCategoryFieldData>): Promise<void> => {
    console.info(`Attempting to delete ${category.fieldData.slug}`);
    try {
      await deleteItem(category.id, categoriesCollectionId);
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, deleteItem, category.id, categoriesCollectionId);
    }
  };

  const categoryPromises = categories.map((item): (() => Promise<void>) => {
    return (): Promise<void> => deleteCategory(item);
  });

  await resolveApiPromises(categoryPromises);
};

const updateCategories = async (navigatorCategories: CategoryItem[]): Promise<void> => {
  const currentCategories = await getCurrentWebflowCategories();
  const overlappingCategories = getOverlappingCategories(currentCategories, navigatorCategories);

  const modify = async (item: WebflowItem<WebflowCategoryFieldData>): Promise<void> => {
    const navigatorCategory = navigatorCategories.find(
      (category) => category.webflowId === item.id,
    );
    if (!navigatorCategory) return;

    console.info(`Attempting to modify ${navigatorCategory.slug} (${item.id})`);
    const webflowCategory = categoryToWebflowFormat(navigatorCategory);

    try {
      await modifyItem(item.id, categoriesCollectionId, webflowCategory);
    } catch (error) {
      await catchRateLimitErrorAndRetry(
        error,
        modifyItem,
        item.id,
        categoriesCollectionId,
        webflowCategory,
      );
    }
  };

  const categoryPromises = overlappingCategories.map((item): (() => Promise<void>) => {
    return (): Promise<void> => modify(item);
  });

  await resolveApiPromises(categoryPromises);
};

const createNewCategories = async (navigatorCategories: CategoryItem[]): Promise<void> => {
  const newCategories = await getNewCategories(navigatorCategories);

  const create = async (category: CategoryItem): Promise<void> => {
    console.info(`Attempting to create ${category.slug}`);
    const webflowCategory = categoryToWebflowFormat(category);

    let result;
    try {
      result = await createItem(webflowCategory, categoriesCollectionId, false);
    } catch (error) {
      result = await catchRateLimitErrorAndRetry(
        error,
        createItem,
        webflowCategory,
        categoriesCollectionId,
        false,
      );
    }

    if (result && (result.data as WebflowCreateItemResponse).id && !category.webflowId) {
      updateCategoryFileWithWebflowId(category.slug, (result.data as WebflowCreateItemResponse).id);
    }
  };

  const categoryPromises = newCategories.map((item): (() => Promise<void>) => {
    return (): Promise<void> => create(item);
  });

  await resolveApiPromises(categoryPromises);
};

const updateCategoryFileWithWebflowId = (slug: string, webflowId: string): void => {
  const filePath = path.join(categoriesDir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContent);

    data.webflowId = webflowId;

    const yamlFrontmatter = Object.entries(data)
      .map(([key, value]) => {
        if (typeof value === "number") {
          return `${key}: ${value}`;
        }
        return `${key}: "${String(value).replaceAll('"', '\\"')}"`;
      })
      .join("\n");

    const newContent = `---
${yamlFrontmatter}
---
`;

    fs.writeFileSync(filePath, newContent, "utf8");
    console.info(`Updated ${filePath} with webflowId: ${webflowId}`);
  }
};

const syncCategories = async (): Promise<void> => {
  const navigatorCategories = loadAllCategoriesFromNavigator();

  console.log(`Found ${navigatorCategories.length} Categories in Navigator`);

  console.log("Deleting unused Categories from Webflow");
  await deleteCategories(navigatorCategories);

  console.log("Updating existing Categories in Webflow");
  await updateCategories(navigatorCategories);

  console.log("Creating new Categories in Webflow");
  await createNewCategories(navigatorCategories);

  console.log("Complete Category Sync!");
};

const main = async (): Promise<void> => {
  await syncCategories();
  /* eslint-disable-next-line unicorn/no-process-exit */
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();

export {
  categoryToWebflowFormat,
  createNewCategories,
  deleteCategories,
  getCurrentWebflowCategories,
  getNewCategories,
  getUnusedCategories,
  loadAllCategoriesFromNavigator,
  syncCategories,
  updateCategories,
  updateCategoryFileWithWebflowId,
};
