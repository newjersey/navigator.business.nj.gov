import { RecentItem } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";
import { getAllItems, htmlToMarkdown, normalizeQuotes } from "./methods";
import { WebflowItem, WebflowRecentFieldData } from "./types";
import { recentsCollectionId } from "./webflowIds";

const recentsDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/recents`,
);

const topicsOptionMap: Record<string, string> = {
  "08c49828a417b6978ad2978d697087da": "Grants and Resources",
  "373d83f11a87e04cff19382a52874620": "Rules and Regulations",
};

const agencyOptionMap: Record<string, string> = {
  "3b2d9803a405687e6ccfc5e54e3969ee": "NJ Department of Labor",
  de8e169fc622002485461d28d1690ad5: "NJ Economic Development Authority",
  ed0573f72c5d20d5b19043eb9145681a: "NJ Department of Transportation",
  "5e555184dcdd442cf474619333d475a6": "NJ Department of Environmental Protection",
  b8107e66002208f48967f09cbcfbb27e: "NJ Department of Treasury",
  a4d3b9f9a7ba3de6f2fccd6f6f0f70bd: "NJ Department of Public Utilities",
  f04e1bc5be41746fccb656fb9d50fdbc: "NJ Business Action Center",
};

const loadAllRecentsFromNavigator = (): RecentItem[] => {
  if (!fs.existsSync(recentsDir)) return [];

  return fs.readdirSync(recentsDir).map((file) => {
    const fullPath = path.join(recentsDir, file);
    const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
    return { ...data, body: content } as RecentItem;
  });
};

const getCurrentWebflowRecents = async (): Promise<WebflowItem<WebflowRecentFieldData>[]> => {
  return getAllItems<WebflowRecentFieldData>(recentsCollectionId);
};

const webflowRecentToNavigatorFormat = (item: WebflowItem<WebflowRecentFieldData>): RecentItem => {
  const { fieldData } = item;

  const topics = fieldData.topics ? topicsOptionMap[fieldData.topics] : undefined;
  if (fieldData.topics && !topics) {
    console.warn(
      `Unknown topics option ID "${fieldData.topics}" for recent "${fieldData.slug}" — skipping topics`,
    );
  }

  const agency = fieldData.agency ? agencyOptionMap[fieldData.agency] : undefined;
  if (fieldData.agency && !agency) {
    console.warn(
      `Unknown agency option ID "${fieldData.agency}" for recent "${fieldData.slug}" — skipping agency`,
    );
  }

  const recent: RecentItem = {
    name: normalizeQuotes(fieldData.name),
    slug: fieldData.slug,
    webflowId: item.id,
    body: htmlToMarkdown(fieldData["section-1"] ?? ""),
  };

  if (fieldData["updated-on-date"]) recent.date = fieldData["updated-on-date"].split("T")[0];
  if (topics) recent.topics = topics;
  if (fieldData.source) recent.source = htmlToMarkdown(fieldData.source);
  if (fieldData["heading-1"]) recent["heading-1"] = normalizeQuotes(fieldData["heading-1"]);
  if (fieldData["homepage-announcement-text-2"])
    recent["homepage-announcement-text-2"] = normalizeQuotes(
      fieldData["homepage-announcement-text-2"],
    );
  if (fieldData["cta-text"]) recent["cta-text"] = normalizeQuotes(fieldData["cta-text"]);
  if (fieldData["cta-link"]) recent["cta-link"] = fieldData["cta-link"];
  if (agency) recent.agency = agency;

  return recent;
};

const writeRecentFile = (recent: RecentItem): void => {
  if (!fs.existsSync(recentsDir)) {
    fs.mkdirSync(recentsDir, { recursive: true });
  }

  const filePath = path.join(recentsDir, `${recent.slug}.md`);
  const { body, ...frontmatter } = recent;
  const content = matter.stringify(body ? `\n${body}` : "", frontmatter);
  fs.writeFileSync(filePath, content, "utf8");
};

const pullRecents = async (): Promise<void> => {
  const webflowRecents = await getCurrentWebflowRecents();
  const navigatorRecents = loadAllRecentsFromNavigator();

  const navigatorRecentByWebflowId = new Map(
    navigatorRecents.filter((r) => r.webflowId).map((r) => [r.webflowId as string, r]),
  );

  console.log(`Found ${webflowRecents.length} recents in Webflow`);

  let updated = 0;
  let created = 0;

  for (const item of webflowRecents) {
    const recent = webflowRecentToNavigatorFormat(item);
    const isExisting = navigatorRecentByWebflowId.has(item.id);

    if (isExisting) {
      console.info(`Updating ${recent.slug} (${item.id})`);
      updated++;
    } else {
      console.info(`Creating ${recent.slug} (${item.id})`);
      created++;
    }

    writeRecentFile(recent);
  }

  console.log(`Complete: updated ${updated}, created ${created}`);
};

const main = async (): Promise<void> => {
  await pullRecents();
  /* eslint-disable-next-line unicorn/no-process-exit */
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();

export {
  agencyOptionMap,
  getCurrentWebflowRecents,
  loadAllRecentsFromNavigator,
  pullRecents,
  topicsOptionMap,
  webflowRecentToNavigatorFormat,
  writeRecentFile,
};
