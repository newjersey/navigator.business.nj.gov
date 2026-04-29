import { CategoryItem, PageItem } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import matter from "gray-matter";
import yaml from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";
import { getAllItems, htmlToMarkdown, normalizeQuotes } from "./methods";
import { WebflowItem, WebflowPageFieldData } from "./types";
import { pagesCollectionId } from "./webflowIds";

const pagesDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/pages`,
);

const categoriesDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/categories`,
);

const loadCategoryMap = (): Map<string, string> => {
  if (!fs.existsSync(categoriesDir)) return new Map();

  const categories: CategoryItem[] = fs
    .readdirSync(categoriesDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(categoriesDir, file), "utf8")));

  return new Map(categories.filter((c) => c.webflowId).map((c) => [c.webflowId as string, c.slug]));
};

const loadAllPagesFromNavigator = (): PageItem[] => {
  if (!fs.existsSync(pagesDir)) return [];

  return fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(pagesDir, file);
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));
      return data as PageItem;
    });
};

const getCurrentWebflowPages = async (): Promise<WebflowItem<WebflowPageFieldData>[]> => {
  return getAllItems<WebflowPageFieldData>(pagesCollectionId);
};

const webflowPageToNavigatorFormat = (
  item: WebflowItem<WebflowPageFieldData>,
  categoryMap: Map<string, string>,
  pageSlugById: Map<string, string>,
): PageItem => {
  const { fieldData } = item;

  const category = fieldData.category ? categoryMap.get(fieldData.category) : undefined;
  if (fieldData.category && !category) {
    console.warn(
      `Unknown category ID "${fieldData.category}" for page "${fieldData.slug}" — skipping category`,
    );
  }

  const primaryPage = fieldData["primary-page"]
    ? pageSlugById.get(fieldData["primary-page"])
    : undefined;
  if (fieldData["primary-page"] && !primaryPage) {
    console.warn(
      `Unknown primary-page ID "${fieldData["primary-page"]}" for page "${fieldData.slug}" — skipping primary-page`,
    );
  }

  const page: PageItem = {
    name: normalizeQuotes(fieldData.name),
    slug: fieldData.slug,
    webflowId: item.id,
  };

  if (category) page.category = category;
  if (fieldData["sub-heading-text"])
    page["sub-heading-text"] = normalizeQuotes(fieldData["sub-heading-text"]);
  if (fieldData["meta-data"]) page["meta-data"] = normalizeQuotes(fieldData["meta-data"]);
  if (fieldData["main-link-text"])
    page["main-link-text"] = normalizeQuotes(fieldData["main-link-text"]);
  if (primaryPage) page["primary-page"] = primaryPage;

  for (let i = 1; i <= 11; i++) {
    const headingKey = `heading-${i}` as keyof PageItem;
    const mainTextKey = `main-text-${i}` as keyof PageItem;
    const linkTextKey = `link-text-${i}` as keyof PageItem;
    const linkKey = `link-${i}` as keyof PageItem;

    const heading = fieldData[headingKey as keyof WebflowPageFieldData] as string | undefined;
    if (heading)
      (page as unknown as Record<string, unknown>)[headingKey] = normalizeQuotes(heading);

    const mainTextHtml = fieldData[mainTextKey as keyof WebflowPageFieldData] as string | undefined;
    if (mainTextHtml)
      (page as unknown as Record<string, unknown>)[mainTextKey] = htmlToMarkdown(mainTextHtml);

    const linkText = fieldData[linkTextKey as keyof WebflowPageFieldData] as string | undefined;
    if (linkText)
      (page as unknown as Record<string, unknown>)[linkTextKey] = normalizeQuotes(linkText);

    const linkField = fieldData[linkKey as keyof WebflowPageFieldData] as
      | { url: string }
      | null
      | undefined;
    if (linkField?.url) (page as unknown as Record<string, unknown>)[linkKey] = linkField.url;

    if (i <= 4) {
      const tipKey = `tip-${i}` as keyof PageItem;
      const tip = fieldData[tipKey as keyof WebflowPageFieldData] as string | undefined;
      if (tip) (page as unknown as Record<string, unknown>)[tipKey] = normalizeQuotes(tip);
    }
  }

  return page;
};

const writePageFile = (page: PageItem): void => {
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }

  const filePath = path.join(pagesDir, `${page.slug}.md`);
  const content = matter.stringify("", page as unknown as Record<string, unknown>, {
    engines: {
      yaml: {
        parse: yaml.load as (input: string) => object,
        stringify: (obj: unknown) => yaml.dump(obj, { lineWidth: -1 }),
      },
    },
  });
  fs.writeFileSync(filePath, content, "utf8");
};

const pullPages = async (): Promise<void> => {
  const webflowPages = await getCurrentWebflowPages();
  const navigatorPages = loadAllPagesFromNavigator();
  const categoryMap = loadCategoryMap();

  const pageSlugById = new Map(webflowPages.map((item) => [item.id, item.fieldData.slug]));

  const navigatorPageByWebflowId = new Map(
    navigatorPages.filter((p) => p.webflowId).map((p) => [p.webflowId as string, p]),
  );

  console.log(`Found ${webflowPages.length} pages in Webflow`);

  let updated = 0;
  let created = 0;

  for (const item of webflowPages) {
    const page = webflowPageToNavigatorFormat(item, categoryMap, pageSlugById);
    const isExisting = navigatorPageByWebflowId.has(item.id);

    if (isExisting) {
      console.info(`Updating ${page.slug} (${item.id})`);
      updated++;
    } else {
      console.info(`Creating ${page.slug} (${item.id})`);
      created++;
    }

    writePageFile(page);
  }

  console.log(`Complete: updated ${updated}, created ${created}`);
};

const main = async (): Promise<void> => {
  await pullPages();
  /* eslint-disable-next-line unicorn/no-process-exit */
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();

export {
  getCurrentWebflowPages,
  loadAllPagesFromNavigator,
  loadCategoryMap,
  pullPages,
  webflowPageToNavigatorFormat,
  writePageFile,
};
