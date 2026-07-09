import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";
import { getAllItems } from "./methods";
import { WebflowLicenseDataFieldData } from "./types";
import { licenseCollectionId } from "./webflowIds";

/**
 * Backfills the `agencyWebsite` frontmatter field on license source files from
 * Webflow's `department-website` field. The agency name links to this URL on the
 * Licensing & Certification Guide card. This data originated only in Webflow and
 * was never carried into our content pipeline; this script folds it in so it can
 * live in Decap-managed content going forward.
 *
 * Files are matched to Webflow items by `webflowId`. The field is inserted as a
 * single raw line before the closing frontmatter fence so unrelated lines are
 * left byte-identical.
 */

const contentRoot = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../../content/src`,
);

const licenseSourceDirectories = [
  path.join(contentRoot, "webflow-licenses"),
  path.join(contentRoot, "roadmaps", "license-tasks"),
  path.join(contentRoot, "roadmaps", "municipal-tasks"),
  path.join(contentRoot, "roadmaps", "tasks"),
];

const fetchDepartmentWebsitesByWebflowId = async (): Promise<Map<string, string>> => {
  const items = await getAllItems<WebflowLicenseDataFieldData & { "department-website"?: string }>(
    licenseCollectionId,
  );
  const websitesByWebflowId = new Map<string, string>();
  for (const item of items) {
    const website = item.fieldData["department-website"];
    if (website) websitesByWebflowId.set(item.id, website);
  }
  return websitesByWebflowId;
};

/**
 * Inserts `agencyWebsite: "<url>"` as the last frontmatter line, preserving every
 * other line exactly. Returns undefined when the file has no frontmatter fence.
 */
const insertAgencyWebsiteLine = (raw: string, url: string): string | undefined => {
  const fenceMatch = raw.match(/^---\n([\S\s]*?)\n---/);
  if (!fenceMatch) return undefined;
  const frontmatter = fenceMatch[1];
  const escaped = url.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  const newFrontmatter = `${frontmatter}\nagencyWebsite: "${escaped}"`;
  return raw.replace(fenceMatch[0], `---\n${newFrontmatter}\n---`);
};

interface BackfillResult {
  updated: number;
  alreadyPresent: number;
  noWebflowId: number;
  noWebsite: number;
  noFence: number;
}

const backfill = (
  websitesByWebflowId: Map<string, string>,
  directories: readonly string[],
): BackfillResult => {
  const result: BackfillResult = {
    updated: 0,
    alreadyPresent: 0,
    noWebflowId: 0,
    noWebsite: 0,
    noFence: 0,
  };

  for (const directory of directories) {
    if (!fs.existsSync(directory)) continue;
    for (const fileName of fs.readdirSync(directory).filter((f) => f.endsWith(".md"))) {
      const filePath = path.join(directory, fileName);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data } = matter(raw);
      const webflowId = typeof data.webflowId === "string" ? data.webflowId : undefined;

      if (!webflowId) {
        result.noWebflowId += 1;
        continue;
      }
      const url = websitesByWebflowId.get(webflowId);
      if (!url) {
        result.noWebsite += 1;
        continue;
      }
      if (data.agencyWebsite !== undefined) {
        result.alreadyPresent += 1;
        continue;
      }
      const updated = insertAgencyWebsiteLine(raw, url);
      if (updated === undefined) {
        result.noFence += 1;
        continue;
      }
      fs.writeFileSync(filePath, updated);
      result.updated += 1;
    }
  }

  return result;
};

const main = async (): Promise<void> => {
  const websitesByWebflowId = await fetchDepartmentWebsitesByWebflowId();
  console.log(`Fetched ${websitesByWebflowId.size} department-website values from Webflow`);
  const result = backfill(websitesByWebflowId, licenseSourceDirectories);
  console.log(
    `Backfill complete: ${result.updated} updated, ${result.alreadyPresent} already present, ` +
      `${result.noWebflowId} without a webflowId, ${result.noWebsite} matched but with no website, ` +
      `${result.noFence} without a frontmatter fence`,
  );
  /* eslint-disable-next-line unicorn/no-process-exit */
  process.exit(0);
};

if (process.env.NODE_ENV !== "test") {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  (async (): Promise<void> => {
    await main();
  })();
}

export { backfill, insertAgencyWebsiteLine };
