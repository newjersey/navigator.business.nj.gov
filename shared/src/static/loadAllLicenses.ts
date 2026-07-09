import fs from "fs";
import matter from "gray-matter";
import path from "path";

export interface WebflowLicenseCard {
  id: string;
  webflowId?: string;
  urlSlug: string;
  name: string;
  displayname?: string;
  webflowName?: string;
  filename: string;
  callToActionLink?: string;
  callToActionText?: string;
  agencyId?: string;
  agencyAdditionalContext?: string;
  divisionPhone?: string;
  industryId?: string;
  webflowType?: string;
  licenseCertificationClassification: string;
  summaryDescriptionMd?: string;
  contentMd: string;
  syncToWebflow?: boolean | string;
  formName?: string;
  webflowIndustry?: string;
  [key: string]: unknown;
}

// process.cwd() is the invoking package's own directory ("..", then content/src)
// when run via `yarn workspace <pkg> build`, but repo root (content/src directly,
// no "..") when run via Jest, which never chdirs regardless of which package.json's
// `test` script triggers it. Only this loader's own test exercises the real
// filesystem (its siblings all mock fs), so it's the only one that has to resolve
// both conventions correctly.
const resolveContentRoot = (): string => {
  const fromPackageDirectory = path.join(process.cwd(), "..", "content", "src");
  const fromRepoRoot = path.join(process.cwd(), "content", "src");
  return fs.existsSync(fromPackageDirectory) ? fromPackageDirectory : fromRepoRoot;
};
const contentRoot = resolveContentRoot();
const webflowLicenseDirectory = path.join(contentRoot, "webflow-licenses");
const licenseTasksDirectory = path.join(contentRoot, "roadmaps", "license-tasks");
const municipalDirectory = path.join(contentRoot, "roadmaps", "municipal-tasks");
const tasksAllDirectory = path.join(contentRoot, "roadmaps", "tasks");

const convertLicenseMd = (mdContents: string, filename: string): WebflowLicenseCard => {
  const matterResult = matter(mdContents);
  return {
    ...matterResult.data,
    contentMd: matterResult.content,
    filename,
  } as WebflowLicenseCard;
};

const loadDirectory = (directory: string): WebflowLicenseCard[] => {
  if (!fs.existsSync(directory)) {
    throw new Error(
      `loadAllLicenses: content directory not found at ${directory} — a source directory was renamed or removed`,
    );
  }
  return fs.readdirSync(directory).map((fileName) => {
    const fileContents = fs.readFileSync(path.join(directory, fileName), "utf8");
    return convertLicenseMd(fileContents, fileName.split(".md")[0]);
  });
};

const dedupeByWebflowId = (licenses: WebflowLicenseCard[]): WebflowLicenseCard[] => {
  const seen = new Set<string>();
  const result: WebflowLicenseCard[] = [];
  for (const license of licenses) {
    if (license.webflowId === undefined || license.webflowId === "") {
      result.push(license);
      continue;
    }
    if (seen.has(license.webflowId)) {
      console.warn(
        `loadAllLicenses: duplicate webflowId ${license.webflowId} on ${license.filename} — skipping`,
      );
      continue;
    }
    seen.add(license.webflowId);
    result.push(license);
  }
  return result;
};

export const loadAllLicenses = (): WebflowLicenseCard[] => {
  const combined = [
    ...loadDirectory(webflowLicenseDirectory),
    ...loadDirectory(licenseTasksDirectory),
    ...loadDirectory(municipalDirectory),
    ...loadDirectory(tasksAllDirectory).filter(
      (license) => license.syncToWebflow === true || license.syncToWebflow === "true",
    ),
  ];
  return dedupeByWebflowId(combined);
};
