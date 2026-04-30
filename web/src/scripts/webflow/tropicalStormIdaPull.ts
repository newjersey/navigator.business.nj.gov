import { TropicalStormIdaItem } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import matter from "gray-matter";
import yaml from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";
import { getAllItems, htmlToMarkdown, normalizeQuotes } from "./methods";
import { WebflowItem, WebflowTropicalStormIdaFieldData } from "./types";
import { tropicalStormIdasCollectionId } from "./webflowIds";

const idaDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/tropical-storm-ida`,
);

const topicsOptionMap: Record<string, string> = {
  "5da91e6f668039a15ffebd2a396518aa": "General Information",
  e47567e97ee92b58e2a8d137f22770bd: "Financial Assistance",
};

const loadAllIdasFromNavigator = (): TropicalStormIdaItem[] => {
  if (!fs.existsSync(idaDir)) return [];

  return fs
    .readdirSync(idaDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(idaDir, file), "utf8"));
      return data as TropicalStormIdaItem;
    });
};

const getCurrentWebflowIdas = async (): Promise<
  WebflowItem<WebflowTropicalStormIdaFieldData>[]
> => {
  return getAllItems<WebflowTropicalStormIdaFieldData>(tropicalStormIdasCollectionId);
};

const webflowIdaToNavigatorFormat = (
  item: WebflowItem<WebflowTropicalStormIdaFieldData>,
): TropicalStormIdaItem => {
  const { fieldData } = item;

  const topics = fieldData.topics ? topicsOptionMap[fieldData.topics] : undefined;
  if (fieldData.topics && !topics) {
    console.warn(
      `Unknown topics option ID "${fieldData.topics}" for ida "${fieldData.slug}" — skipping topics`,
    );
  }

  const ida: TropicalStormIdaItem = {
    name: normalizeQuotes(fieldData.name),
    slug: fieldData.slug,
    webflowId: item.id,
  };

  if (fieldData["updated-on-date"]) ida.date = fieldData["updated-on-date"].split("T")[0];
  if (topics) ida.topics = topics;
  if (fieldData.source) ida.source = htmlToMarkdown(fieldData.source);
  if (fieldData["s1-heading"]) ida["s1-heading"] = normalizeQuotes(fieldData["s1-heading"]);
  if (fieldData.section1) ida["section-1"] = htmlToMarkdown(fieldData.section1);
  if (fieldData["s2-heading"]) ida["s2-heading"] = normalizeQuotes(fieldData["s2-heading"]);
  if (fieldData["section-2"]) ida["section-2"] = htmlToMarkdown(fieldData["section-2"]);
  if (fieldData["homepage-announcement-text"])
    ida["homepage-announcement-text"] = normalizeQuotes(fieldData["homepage-announcement-text"]);

  return ida;
};

const writeIdaFile = (ida: TropicalStormIdaItem): void => {
  if (!fs.existsSync(idaDir)) {
    fs.mkdirSync(idaDir, { recursive: true });
  }

  const filePath = path.join(idaDir, `${ida.slug}.md`);
  const content = matter.stringify("", ida as unknown as Record<string, unknown>, {
    engines: {
      yaml: {
        parse: yaml.load as (input: string) => object,
        stringify: (obj: unknown) => yaml.dump(obj, { lineWidth: -1 }),
      },
    },
  });
  fs.writeFileSync(filePath, content, "utf8");
};

const pullIdas = async (): Promise<void> => {
  const webflowIdas = await getCurrentWebflowIdas();
  const navigatorIdas = loadAllIdasFromNavigator();

  const navigatorIdaByWebflowId = new Map(
    navigatorIdas.filter((i) => i.webflowId).map((i) => [i.webflowId as string, i]),
  );

  console.log(`Found ${webflowIdas.length} Tropical Storm Ida items in Webflow`);

  let updated = 0;
  let created = 0;

  for (const item of webflowIdas) {
    const ida = webflowIdaToNavigatorFormat(item);
    const isExisting = navigatorIdaByWebflowId.has(item.id);

    if (isExisting) {
      console.info(`Updating ${ida.slug} (${item.id})`);
      updated++;
    } else {
      console.info(`Creating ${ida.slug} (${item.id})`);
      created++;
    }

    writeIdaFile(ida);
  }

  console.log(`Complete: updated ${updated}, created ${created}`);
};

const main = async (): Promise<void> => {
  await pullIdas();
  /* eslint-disable-next-line unicorn/no-process-exit */
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();

export {
  getCurrentWebflowIdas,
  loadAllIdasFromNavigator,
  pullIdas,
  topicsOptionMap,
  webflowIdaToNavigatorFormat,
  writeIdaFile,
};
