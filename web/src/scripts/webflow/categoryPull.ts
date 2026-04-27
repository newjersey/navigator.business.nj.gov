import { CategoryItem } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getAllItems, normalizeQuotes } from "./methods";
import { WebflowCategoryFieldData, WebflowItem } from "./types";
import { categoriesCollectionId } from "./webflowIds";

const categoriesDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/categories`,
);

const loadAllCategoriesFromNavigator = (): CategoryItem[] => {
  if (!fs.existsSync(categoriesDir)) return [];

  const categoryFiles = fs.readdirSync(categoriesDir);

  return categoryFiles.map((file) => {
    const fullPath = path.join(categoriesDir, file);
    return JSON.parse(fs.readFileSync(fullPath, "utf8")) as CategoryItem;
  });
};

const getCurrentWebflowCategories = async (): Promise<WebflowItem<WebflowCategoryFieldData>[]> => {
  return await getAllItems<WebflowCategoryFieldData>(categoriesCollectionId);
};

const webflowCategoryToNavigatorFormat = (
  item: WebflowItem<WebflowCategoryFieldData>,
): CategoryItem => {
  const { fieldData } = item;
  const category: CategoryItem = {
    name: normalizeQuotes(fieldData.name),
    slug: fieldData.slug,
    webflowId: item.id,
  };

  if (fieldData["nav-name"]) category["nav-name"] = normalizeQuotes(fieldData["nav-name"]);
  if (fieldData["description-text"])
    category["description-text"] = normalizeQuotes(fieldData["description-text"]);
  if (fieldData["topic-description"])
    category["topic-description"] = normalizeQuotes(fieldData["topic-description"]);
  if (fieldData["homepage-description"])
    category["homepage-description"] = normalizeQuotes(fieldData["homepage-description"]);

  return category;
};

const writeCategoryFile = (category: CategoryItem): void => {
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }

  const filePath = path.join(categoriesDir, `${category.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(category, null, 2), "utf8");
};

const pullCategories = async (): Promise<void> => {
  const webflowCategories = await getCurrentWebflowCategories();
  const navigatorCategories = loadAllCategoriesFromNavigator();

  const navigatorCategoryByWebflowId = new Map(
    navigatorCategories.filter((c) => c.webflowId).map((c) => [c.webflowId as string, c]),
  );

  console.log(`Found ${webflowCategories.length} categories in Webflow`);

  let updated = 0;
  let created = 0;

  for (const item of webflowCategories) {
    const category = webflowCategoryToNavigatorFormat(item);
    const isExisting = navigatorCategoryByWebflowId.has(item.id);

    if (isExisting) {
      console.info(`Updating ${category.slug} (${item.id})`);
      updated++;
    } else {
      console.info(`Creating ${category.slug} (${item.id})`);
      created++;
    }

    writeCategoryFile(category);
  }

  console.log(`Complete: updated ${updated}, created ${created}`);
};

const main = async (): Promise<void> => {
  await pullCategories();
  /* eslint-disable-next-line unicorn/no-process-exit */
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();

export {
  getCurrentWebflowCategories,
  loadAllCategoriesFromNavigator,
  pullCategories,
  webflowCategoryToNavigatorFormat,
  writeCategoryFile,
};
