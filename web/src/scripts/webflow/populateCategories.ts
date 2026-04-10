import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getAllItems } from "./methods";
import { WebflowCategoryFieldData, WebflowImageField, WebflowItem } from "./types";
import { categoriesCollectionId } from "./webflowIds";

const categoriesDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/categories`,
);

if (!fs.existsSync(categoriesDir)) {
  fs.mkdirSync(categoriesDir, { recursive: true });
}

const serializeImageField = (image: WebflowImageField | undefined): string | undefined => {
  if (!image) return undefined;
  return image.url;
};

const createCategoryMarkdownFile = (category: WebflowItem<WebflowCategoryFieldData>): void => {
  const { fieldData } = category;

  const frontmatter: Record<string, unknown> = {
    name: fieldData.name,
    slug: fieldData.slug,
    webflowId: category.id,
  };

  if (fieldData["nav-name"]) {
    frontmatter["nav-name"] = fieldData["nav-name"];
  }

  if (fieldData["description-text"]) {
    frontmatter["description-text"] = fieldData["description-text"];
  }

  if (fieldData["navbar-order"] !== undefined) {
    frontmatter["navbar-order"] = fieldData["navbar-order"];
  }

  if (fieldData["customized-drop-down-link-filter"]) {
    frontmatter["customized-drop-down-link-filter"] = fieldData["customized-drop-down-link-filter"];
  }

  // Handle image fields
  const bgImage = serializeImageField(fieldData["bg-image"]);
  if (bgImage) {
    frontmatter["bg-image"] = bgImage;
  }

  const topicIcon = serializeImageField(fieldData["topic-icon"]);
  if (topicIcon) {
    frontmatter["topic-icon"] = topicIcon;
  }

  const mobileIcon = serializeImageField(fieldData["mobile-icon"]);
  if (mobileIcon) {
    frontmatter["mobile-icon"] = mobileIcon;
  }

  const topicIconWhiteBg = serializeImageField(fieldData["topic-icon-white-bg"]);
  if (topicIconWhiteBg) {
    frontmatter["topic-icon-white-bg"] = topicIconWhiteBg;
  }

  const topicIconCatPage = serializeImageField(fieldData["topic-icon-cat-page"]);
  if (topicIconCatPage) {
    frontmatter["topic-icon-cat-page"] = topicIconCatPage;
  }

  const arrow = serializeImageField(fieldData.arrow);
  if (arrow) {
    frontmatter.arrow = arrow;
  }

  const navigatorPromotionImage = serializeImageField(fieldData["navigator-promotion-image"]);
  if (navigatorPromotionImage) {
    frontmatter["navigator-promotion-image"] = navigatorPromotionImage;
  }

  if (fieldData["icon-accessibility-alt-description"]) {
    frontmatter["icon-accessibility-alt-description"] =
      fieldData["icon-accessibility-alt-description"];
  }

  if (fieldData["topic-color"]) {
    frontmatter["topic-color"] = fieldData["topic-color"];
  }

  if (fieldData["topic-description"]) {
    frontmatter["topic-description"] = fieldData["topic-description"];
  }

  if (fieldData["homepage-description"]) {
    frontmatter["homepage-description"] = fieldData["homepage-description"];
  }

  if (fieldData["nav-promo-hero-button-text"]) {
    frontmatter["nav-promo-hero-button-text"] = fieldData["nav-promo-hero-button-text"];
  }

  if (fieldData["nav-promo-heading"]) {
    frontmatter["nav-promo-heading"] = fieldData["nav-promo-heading"];
  }

  if (fieldData["nav-promo-description"]) {
    frontmatter["nav-promo-description"] = fieldData["nav-promo-description"];
  }

  if (fieldData["nav-promo-button-text"]) {
    frontmatter["nav-promo-button-text"] = fieldData["nav-promo-button-text"];
  }

  if (fieldData["navigation-promotion-color"]) {
    frontmatter["navigation-promotion-color"] = fieldData["navigation-promotion-color"];
  }

  if (fieldData["navigation-tile-border-color"]) {
    frontmatter["navigation-tile-border-color"] = fieldData["navigation-tile-border-color"];
  }

  if (fieldData["nav-promo-text-color-2"]) {
    frontmatter["nav-promo-text-color-2"] = fieldData["nav-promo-text-color-2"];
  }

  if (fieldData["category-page-tile-background"]) {
    frontmatter["category-page-tile-background"] = fieldData["category-page-tile-background"];
  }

  if (fieldData["category-page-header"]) {
    frontmatter["category-page-header"] = fieldData["category-page-header"];
  }

  if (fieldData["category-page-promo-text"]) {
    frontmatter["category-page-promo-text"] = fieldData["category-page-promo-text"];
  }

  if (fieldData["side-nav-hover-color"]) {
    frontmatter["side-nav-hover-color"] = fieldData["side-nav-hover-color"];
  }

  if (fieldData["side-nav-background-color"]) {
    frontmatter["side-nav-background-color"] = fieldData["side-nav-background-color"];
  }

  if (fieldData["side-nav-active-color"]) {
    frontmatter["side-nav-active-color"] = fieldData["side-nav-active-color"];
  }

  const yamlFrontmatter = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === "number") {
        return `${key}: ${value}`;
      }
      return `${key}: "${String(value).replaceAll('"', '\\"')}"`;
    })
    .join("\n");

  const fileContent = `---
${yamlFrontmatter}
---
`;

  // Write markdown file
  const filePath = path.join(categoriesDir, `${fieldData.slug}.md`);
  fs.writeFileSync(filePath, fileContent, "utf8");
  console.log(`Created: ${filePath}`);
};

const main = async (): Promise<void> => {
  console.log("Fetching Categories from Webflow...");
  const categories = await getAllItems<WebflowCategoryFieldData>(categoriesCollectionId);

  console.log(`Found ${categories.length} Categories in Webflow`);
  console.log("Creating markdown files...");

  for (const category of categories) {
    createCategoryMarkdownFile(category);
  }

  console.log("Done! Category files created in content/src/categories/");
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();
