import fs from "fs";
import path from "path";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { fileURLToPath } from "url";
import { getCategorySlugById, getSubCategorySlugById } from "./faqSync";
import { getAllItems } from "./methods";
import { WebflowFaqFieldData, WebflowItem } from "./types";
import { faqCollectionId } from "./webflowIds";

const faqDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/faqs`,
);

if (!fs.existsSync(faqDir)) {
  fs.mkdirSync(faqDir, { recursive: true });
}

const convertHtmlToMarkdown = async (html: string): Promise<string> => {
  const result = await unified()
    // @ts-expect-error - unified type compatibility
    .use(rehypeParse)
    .use(rehypeRemark)
    // @ts-expect-error - unified type compatibility
    .use(remarkStringify, {
      bullet: "-",
      emphasis: "*",
      strong: "*",
    })
    .process(html);

  return result.toString().trim();
};

const createFaqMarkdownFile = async (faq: WebflowItem<WebflowFaqFieldData>): Promise<void> => {
  const { fieldData } = faq;

  const markdownContent = fieldData["support-post"]
    ? await convertHtmlToMarkdown(fieldData["support-post"])
    : "";

  const frontmatter: Record<string, unknown> = {
    name: fieldData.name,
    slug: fieldData.slug,
    webflowId: faq.id,
  };

  if (fieldData.category) {
    frontmatter.category = getCategorySlugById(fieldData.category);
  }

  if (fieldData["sub-category"]) {
    frontmatter["sub-category"] = getSubCategorySlugById(fieldData["sub-category"]);
  }

  if (fieldData.author) {
    frontmatter.author = fieldData.author;
  }

  const yamlFrontmatter = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: "${String(value).replaceAll('"', '\\"')}"`)
    .join("\n");

  const fileContent = `---
${yamlFrontmatter}
---

${markdownContent}
`;

  // Write markdown file
  const filePath = path.join(faqDir, `${fieldData.slug}.md`);
  fs.writeFileSync(filePath, fileContent, "utf8");
  console.log(`Created: ${filePath}`);
};

const main = async (): Promise<void> => {
  console.log("Fetching FAQs from Webflow...");
  const faqs = await getAllItems<WebflowFaqFieldData>(faqCollectionId);

  console.log(`Found ${faqs.length} FAQs in Webflow`);
  console.log("Creating markdown files...");

  await Promise.all(faqs.map((faq) => createFaqMarkdownFile(faq)));

  console.log("Done! FAQ files created in content/src/faqs/");
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();
