import { FaqItem, SubCategoryItem } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import matter from "gray-matter"; // used for reading existing files
import path from "path";
import { fileURLToPath } from "url";
import { getAllItems, htmlToMarkdown, normalizeQuotes } from "./methods";
import { WebflowFaqFieldData, WebflowItem } from "./types";
import { faqCollectionId } from "./webflowIds";

const faqDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/faqs`,
);

const subCategoriesDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/sub-categories`,
);

// Webflow FAQ category field stores option IDs, not collection references
const categoryOptionMap: Record<string, string> = {
  acd272aef61b78c5513c956a7ff19aa7: "plan-a-business",
  c98f77fc3a00bc67ec7dc62a882c8cef: "start-a-business",
  "4079af3822e05b78591d8872a917786e": "operate-a-business",
  ad67de5042946dd495649f7b3d69000b: "grow-a-business",
  ae99ce63bad69e9f1af0661836a12989: "finance-a-business",
  "3dfe438503f34f928300f2b5d94bd9e4": "resources",
};

const loadAllFaqsFromNavigator = (): FaqItem[] => {
  if (!fs.existsSync(faqDir)) return [];

  return fs
    .readdirSync(faqDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(faqDir, file);
      const fileContent = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContent);
      return {
        name: data.name as string,
        slug: data.slug as string,
        webflowId: data.webflowId as string | undefined,
        category: data.category as string | undefined,
        "sub-category": data["sub-category"] as string | undefined,
        body: content,
      };
    });
};

const loadSubCategoryMap = (): Map<string, string> => {
  if (!fs.existsSync(subCategoriesDir)) return new Map();

  const subCategories: SubCategoryItem[] = fs
    .readdirSync(subCategoriesDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(subCategoriesDir, file), "utf8")));

  return new Map(
    subCategories.filter((sc) => sc.webflowId).map((sc) => [sc.webflowId as string, sc.slug]),
  );
};

const getCurrentWebflowFaqs = async (): Promise<WebflowItem<WebflowFaqFieldData>[]> => {
  return getAllItems<WebflowFaqFieldData>(faqCollectionId);
};

const webflowFaqToNavigatorFormat = (
  item: WebflowItem<WebflowFaqFieldData>,
  subCategoryMap: Map<string, string>,
): FaqItem => {
  const { fieldData } = item;

  const category = fieldData.category ? categoryOptionMap[fieldData.category] : undefined;
  if (fieldData.category && !category) {
    console.warn(
      `Unknown category option ID "${fieldData.category}" for FAQ "${fieldData.slug}" — skipping category`,
    );
  }

  const subCategory = fieldData["sub-category"]
    ? subCategoryMap.get(fieldData["sub-category"])
    : undefined;
  if (fieldData["sub-category"] && !subCategory) {
    console.warn(
      `Unknown sub-category option ID "${fieldData["sub-category"]}" for FAQ "${fieldData.slug}" — skipping sub-category`,
    );
  }

  return {
    name: normalizeQuotes(fieldData.name),
    slug: fieldData.slug,
    webflowId: item.id,
    category,
    "sub-category": subCategory,
    body: htmlToMarkdown(fieldData["support-post"] ?? ""),
  };
};

const toYamlLine = (key: string, value: string): string =>
  `${key}: "${value.replaceAll('"', '\\"')}"`;

const writeFaqFile = (faq: FaqItem): void => {
  if (!fs.existsSync(faqDir)) {
    fs.mkdirSync(faqDir, { recursive: true });
  }

  const filePath = path.join(faqDir, `${faq.slug}.md`);

  const yamlLines = [
    toYamlLine("name", faq.name),
    toYamlLine("slug", faq.slug),
    toYamlLine("webflowId", faq.webflowId ?? ""),
  ];

  if (faq.category) yamlLines.push(toYamlLine("category", faq.category));
  if (faq["sub-category"]) yamlLines.push(toYamlLine("sub-category", faq["sub-category"]));

  const content = `---\n${yamlLines.join("\n")}\n---\n${faq.body ? `\n${faq.body}\n` : ""}`;
  fs.writeFileSync(filePath, content, "utf8");
};

const pullFaqs = async (): Promise<void> => {
  const webflowFaqs = await getCurrentWebflowFaqs();
  const navigatorFaqs = loadAllFaqsFromNavigator();
  const subCategoryMap = loadSubCategoryMap();

  const navigatorFaqByWebflowId = new Map(
    navigatorFaqs.filter((f) => f.webflowId).map((f) => [f.webflowId as string, f]),
  );

  console.log(`Found ${webflowFaqs.length} FAQs in Webflow`);

  let updated = 0;
  let created = 0;

  for (const item of webflowFaqs) {
    const faq = webflowFaqToNavigatorFormat(item, subCategoryMap);
    const isExisting = navigatorFaqByWebflowId.has(item.id);

    if (isExisting) {
      console.info(`Updating ${faq.slug} (${item.id})`);
      updated++;
    } else {
      console.info(`Creating ${faq.slug} (${item.id})`);
      created++;
    }

    writeFaqFile(faq);
  }

  console.log(`Complete: updated ${updated}, created ${created}`);
};

const main = async (): Promise<void> => {
  await pullFaqs();
  /* eslint-disable-next-line unicorn/no-process-exit */
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();

export {
  categoryOptionMap,
  getCurrentWebflowFaqs,
  loadAllFaqsFromNavigator,
  loadSubCategoryMap,
  pullFaqs,
  webflowFaqToNavigatorFormat,
  writeFaqFile,
};
