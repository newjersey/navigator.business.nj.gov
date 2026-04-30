import { CovidItem } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import matter from "gray-matter";
import yaml from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";
import { getAllItems, htmlToMarkdown, normalizeQuotes } from "./methods";
import { WebflowCovidFieldData, WebflowItem } from "./types";
import { covidsCollectionId } from "./webflowIds";

const covidsDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src/covids`,
);

const topicOptionMap: Record<string, string> = {
  "12c69a4cbf582d95f5a0ee641f459041": "Business Operation Restrictions",
  "4ae005cfb99f35f393a71aa16a46246d": "Economic Assistance for Businesses",
  aae277eee4dbed861ab6abcfedf97e66: "Business Resources and Finances",
  a5eb6be29a94c05b660eeeb143888c7a: "Benefits for Impacted Individuals",
  b781a5a933b8dd6f11cf6e9c470ab074: "General Information about COVID-19",
  "514fa256f667566659cfcbc8c4cff9b8": "Most Recent Guidance",
};

const loadAllCovidsFromNavigator = (): CovidItem[] => {
  if (!fs.existsSync(covidsDir)) return [];

  return fs
    .readdirSync(covidsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(covidsDir, file);
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));
      return data as CovidItem;
    });
};

const getCurrentWebflowCovids = async (): Promise<WebflowItem<WebflowCovidFieldData>[]> => {
  return getAllItems<WebflowCovidFieldData>(covidsCollectionId);
};

const webflowCovidToNavigatorFormat = (item: WebflowItem<WebflowCovidFieldData>): CovidItem => {
  const { fieldData } = item;

  const topic = fieldData.section ? topicOptionMap[fieldData.section] : undefined;
  if (fieldData.section && !topic) {
    console.warn(
      `Unknown topic option ID "${fieldData.section}" for covid "${fieldData.slug}" — skipping topic`,
    );
  }

  const covid: CovidItem = {
    name: normalizeQuotes(fieldData.name),
    slug: fieldData.slug,
    webflowId: item.id,
  };

  if (topic) covid.topic = topic;
  if (fieldData.source) covid.source = htmlToMarkdown(fieldData.source);

  for (let i = 1; i <= 15; i++) {
    const headlineKey = `s${i}-headline` as keyof WebflowCovidFieldData;
    const sectionKey = `section-${i}` as keyof WebflowCovidFieldData;

    const headline = fieldData[headlineKey] as string | undefined;
    if (headline) covid[`s${i}-headline`] = normalizeQuotes(headline);

    const sectionContent = fieldData[sectionKey] as string | undefined;
    if (sectionContent) covid[`section-${i}`] = htmlToMarkdown(sectionContent);
  }

  return covid;
};

const writeCovidFile = (covid: CovidItem): void => {
  if (!fs.existsSync(covidsDir)) {
    fs.mkdirSync(covidsDir, { recursive: true });
  }

  const filePath = path.join(covidsDir, `${covid.slug}.md`);
  const content = matter.stringify("", covid as unknown as Record<string, unknown>, {
    engines: {
      yaml: {
        parse: yaml.load as (input: string) => object,
        stringify: (obj: unknown) => yaml.dump(obj, { lineWidth: -1 }),
      },
    },
  });
  fs.writeFileSync(filePath, content, "utf8");
};

const pullCovids = async (): Promise<void> => {
  const webflowCovids = await getCurrentWebflowCovids();
  const navigatorCovids = loadAllCovidsFromNavigator();

  const navigatorCovidByWebflowId = new Map(
    navigatorCovids.filter((c) => c.webflowId).map((c) => [c.webflowId as string, c]),
  );

  console.log(`Found ${webflowCovids.length} covids in Webflow`);

  let updated = 0;
  let created = 0;

  for (const item of webflowCovids) {
    const covid = webflowCovidToNavigatorFormat(item);
    const isExisting = navigatorCovidByWebflowId.has(item.id);

    if (isExisting) {
      console.info(`Updating ${covid.slug} (${item.id})`);
      updated++;
    } else {
      console.info(`Creating ${covid.slug} (${item.id})`);
      created++;
    }

    writeCovidFile(covid);
  }

  console.log(`Complete: updated ${updated}, created ${created}`);
};

const main = async (): Promise<void> => {
  await pullCovids();
  /* eslint-disable-next-line unicorn/no-process-exit */
  process.exit(0);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
(async (): Promise<void> => {
  await main();
})();

export {
  getCurrentWebflowCovids,
  loadAllCovidsFromNavigator,
  pullCovids,
  topicOptionMap,
  webflowCovidToNavigatorFormat,
  writeCovidFile,
};
