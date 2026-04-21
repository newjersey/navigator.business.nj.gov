import { PageItem } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { fileURLToPath } from "url";
import { catchRateLimitErrorAndRetry, resolveApiPromises } from "./helpers";
import { getAllItems, modifyItem } from "./methods";
import { WebflowItem, WebflowPageFieldData } from "./types";
import { pagesCollectionId } from "./webflowIds";

const pagesDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/pages`,
);

const loadAllPagesFromNavigator = (): PageItem[] => {
  if (!fs.existsSync(pagesDir)) return [];

  const pageFiles = fs.readdirSync(pagesDir).filter((file) => file.endsWith(".md"));

  return pageFiles.map((file) => {
    const fullPath = path.join(pagesDir, file);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContent);

    // All fields including main-text-1 through main-text-11 are in frontmatter
    return data as PageItem;
  });
};

const getCurrentWebflowPages = async (): Promise<WebflowItem<WebflowPageFieldData>[]> => {
  return await getAllItems<WebflowPageFieldData>(pagesCollectionId);
};

const markdownToHtml = (markdown: string | undefined): string | undefined => {
  if (!markdown) return undefined;
  const result = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown);
  return String(result);
};

const pageToWebflowFormat = (page: PageItem): Record<string, unknown> => {
  const webflowData: Record<string, unknown> = {
    name: page.name,
    slug: page.slug,
    category: page.category,
    rank: page.rank ?? null,
    "sub-heading-text": page["sub-heading-text"] ?? null,
    "teaser-text": page["teaser-text"] ?? null,
    "include-in-home-slider": page["include-in-home-slider"] ?? false,
    "homepage-slider-order": page["homepage-slider-order"] ?? null,
    "is-sub-page": page["is-sub-page"] ?? false,
    "primary-page": page["primary-page"] ?? null,
    "main-link-text": page["main-link-text"] ?? null,
    "non-collection-link": page["non-collection-link"]
      ? { url: page["non-collection-link"] }
      : null,
    "coming-soon": page["coming-soon"] ?? false,
    "meta-data": page["meta-data"] ?? null,
    "relative-link": page["relative-link"] ? { url: page["relative-link"] } : null,
    "is-unique-page": page["is-unique-page"] ?? false,
    "navigator-button": page["navigator-button"] ?? false,
  };

  // Handle all 11 sections - explicitly send all fields
  for (let i = 1; i <= 11; i++) {
    const headingKey = `heading-${i}`;
    const mainTextKey = `main-text-${i}`;
    const linkTextKey = `link-text-${i}`;
    const linkKey = `link-${i}`;
    const tipKey = i <= 4 ? `tip-${i}` : null;

    webflowData[headingKey] = page[headingKey as keyof PageItem] ?? null;

    // Convert markdown to HTML for main-text fields
    const mainTextMarkdown = page[mainTextKey as keyof PageItem] as string | undefined;
    webflowData[mainTextKey] = mainTextMarkdown ? markdownToHtml(mainTextMarkdown) : null;

    webflowData[linkTextKey] = page[linkTextKey as keyof PageItem] ?? null;

    const linkUrl = page[linkKey as keyof PageItem] as string | undefined;
    webflowData[linkKey] = linkUrl ? { url: linkUrl } : null;

    if (tipKey) {
      webflowData[tipKey] = page[tipKey as keyof PageItem] ?? null;
    }
  }

  return webflowData;
};

const getOverlappingPages = (
  currentPages: WebflowItem<WebflowPageFieldData>[],
  navigatorPages: PageItem[],
): WebflowItem<WebflowPageFieldData>[] => {
  const pageWebflowIds = new Set(
    navigatorPages.filter((page) => page.webflowId).map((page) => page.webflowId as string),
  );
  return currentPages.filter((item) => pageWebflowIds.has(item.id));
};

const updatePages = async (navigatorPages: PageItem[]): Promise<void> => {
  const currentPages = await getCurrentWebflowPages();
  const overlappingPages = getOverlappingPages(currentPages, navigatorPages);

  const modify = async (item: WebflowItem<WebflowPageFieldData>): Promise<void> => {
    const navigatorPage = navigatorPages.find((page) => page.webflowId === item.id);
    if (!navigatorPage) return;

    console.info(`Attempting to modify ${navigatorPage.slug} (${item.id})`);

    const webflowPage = pageToWebflowFormat(navigatorPage);

    console.log("\n=== Payload size ===");
    console.log(`Number of fields: ${Object.keys(webflowPage).length}`);
    console.log(`Total JSON size: ${JSON.stringify(webflowPage).length} bytes`);
    console.log(`main-text-2 length: ${String(webflowPage["main-text-2"] || "").length}`);

    try {
      await modifyItem(item.id, pagesCollectionId, webflowPage);
      console.log("✓ Update successful");
    } catch (error) {
      await catchRateLimitErrorAndRetry(error, modifyItem, item.id, pagesCollectionId, webflowPage);
    }
  };

  const pagePromises = overlappingPages.map((item): (() => Promise<void>) => {
    return (): Promise<void> => modify(item);
  });

  await resolveApiPromises(pagePromises);
};

const updatePageFileWithWebflowId = (slug: string, webflowId: string): void => {
  const filePath = path.join(pagesDir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    data.webflowId = webflowId;

    const yamlFrontmatter = Object.entries(data)
      .map(([key, value]) => {
        if (typeof value === "number") {
          return `${key}: ${value}`;
        }
        if (typeof value === "boolean") {
          return `${key}: ${value}`;
        }
        return `${key}: "${String(value).replaceAll('"', '\\"')}"`;
      })
      .join("\n");

    const newContent = `---
${yamlFrontmatter}
---

${content}
`;

    fs.writeFileSync(filePath, newContent, "utf8");
    console.info(`Updated ${filePath} with webflowId: ${webflowId}`);
  }
};

const syncPages = async (): Promise<void> => {
  const navigatorPages = loadAllPagesFromNavigator();

  console.log(`Found ${navigatorPages.length} Pages in Navigator`);

  console.log("Updating existing Pages in Webflow");
  await updatePages(navigatorPages);

  console.log("Complete Page Sync!");
};

const main = async (): Promise<void> => {
  await syncPages();
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
  pageToWebflowFormat,
  syncPages,
  updatePageFileWithWebflowId,
  updatePages,
};
