import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getCategorySlugById, getSubCategorySlugById } from "./faqSync";
import { getAllItems } from "./methods";
import { WebflowFaqFieldData, WebflowItem } from "./types";
import { faqCollectionId } from "./webflowIds";

const faqDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/faqs`,
);

// Create the faqs directory if it doesn't exist
if (!fs.existsSync(faqDir)) {
  fs.mkdirSync(faqDir, { recursive: true });
}

const convertHtmlToMarkdown = (html: string): string => {
  // Basic HTML to Markdown conversion
  // This handles common cases but might need refinement
  return html
    .replaceAll(/<p>/gi, "")
    .replaceAll(/<\/p>/gi, "\n\n")
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replaceAll(/<b>(.*?)<\/b>/gi, "**$1**")
    .replaceAll(/<em>(.*?)<\/em>/gi, "*$1*")
    .replaceAll(/<i>(.*?)<\/i>/gi, "*$1*")
    .replaceAll(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replaceAll(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
    .replaceAll(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
    .replaceAll(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
    .replaceAll(/<h4>(.*?)<\/h4>/gi, "#### $1\n\n")
    .replaceAll(/<ul>/gi, "")
    .replaceAll(/<\/ul>/gi, "\n")
    .replaceAll(/<ol>/gi, "")
    .replaceAll(/<\/ol>/gi, "\n")
    .replaceAll(/<li>(.*?)<\/li>/gi, "- $1\n")
    .trim();
};

const createFaqMarkdownFile = (faq: WebflowItem<WebflowFaqFieldData>): void => {
  const { fieldData } = faq;

  // Convert HTML content to Markdown
  const markdownContent = fieldData["support-post"]
    ? convertHtmlToMarkdown(fieldData["support-post"])
    : "";

  // Create frontmatter
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

  // Convert frontmatter to YAML
  const yamlFrontmatter = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: "${String(value).replaceAll('"', '\\"')}"`)
    .join("\n");

  // Create file content
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

  for (const faq of faqs) {
    createFaqMarkdownFile(faq);
  }

  console.log("Done! FAQ files created in content/src/faqs/");
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();
