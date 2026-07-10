import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  CategoryItem,
  Certification,
  FaqItem,
  Filing,
  Funding,
  Industry,
  License,
  LicenseEventType,
  PageItem,
  RecentItem,
  Sector,
  SubCategoryItem,
  Task,
} from "./types";

/**
 * Possible content roots for package scripts and the Next standalone server.
 */
const CONTENT_ROOT_DIRECTORY_CANDIDATES = [
  path.resolve(process.cwd(), "../../content"),
  path.resolve(process.cwd(), "../../../../content"),
] as const;

/**
 * Checks whether a resolved content directory is present on disk.
 */
const isExistingDirectory = (directoryPath: string): boolean => {
  return fs.existsSync(directoryPath);
};

/**
 * Resolves the repository content package root for the current runtime layout.
 */
const resolveContentRootDirectory = (): string => {
  const contentRootDirectory = CONTENT_ROOT_DIRECTORY_CANDIDATES.find(isExistingDirectory);

  if (!contentRootDirectory) {
    throw new Error(
      `Unable to locate the content package. Checked: ${CONTENT_ROOT_DIRECTORY_CANDIDATES.join(
        ", ",
      )}.`,
    );
  }

  return contentRootDirectory;
};

/**
 * Root directory of the repository content package.
 */
const CONTENT_ROOT_DIR = resolveContentRootDirectory();

/**
 * Built content JSON emitted by the repository content package.
 */
const CONTENT_LIB_DIR = path.join(CONTENT_ROOT_DIR, "lib");

/**
 * Source content managed by the repository content package.
 */
const CONTENT_SRC_DIR = path.join(CONTENT_ROOT_DIR, "src");

const readContentJson = (filename: string): unknown => {
  const filePath = path.join(CONTENT_LIB_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

const readMarkdownDirectory = <T>(subdir: string): T[] => {
  const dir = path.join(CONTENT_SRC_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(dir, fileName), "utf-8");
      const { data, content } = matter(raw);
      return { ...data, body: content } as T;
    });
};

const readMarkdownFile = <T>(subdir: string, slug: string): T => {
  const filePath = path.join(CONTENT_SRC_DIR, subdir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Content file not found: ${subdir}/${slug}.md`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...data, body: content } as T;
};

const readJsonDirectory = <T>(subdir: string): T[] => {
  const dir = path.join(CONTENT_SRC_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(dir, fileName), "utf-8");
      return JSON.parse(raw) as T;
    });
};

export const loadIndustries = (): Industry[] =>
  (readContentJson("industry.json") as { industries: Industry[] }).industries.filter(
    (industry) => industry.isEnabled,
  );

export const loadSectors = (): Sector[] =>
  (readContentJson("sectors.json") as { sectors: Sector[] }).sectors;

export const loadTasks = (): Task[] => (readContentJson("tasks.json") as { tasks: Task[] }).tasks;

export const loadAnytimeActions = (): AnytimeActionTask[] =>
  (readContentJson("actions.json") as { actions: AnytimeActionTask[] }).actions;

export const loadCertifications = (): Certification[] =>
  (
    readContentJson("certifications.json") as {
      certifications: Certification[];
    }
  ).certifications;

export const loadFilings = (): Filing[] =>
  (readContentJson("filings.json") as { filings: Filing[] }).filings;

export const loadFundings = (): Funding[] =>
  (readContentJson("fundings.json") as { fundings: Funding[] }).fundings.filter(
    (funding) => funding.publishStageArchive !== "Do Not Publish",
  );

export const loadLicenseCalendarEvents = (): LicenseEventType[] =>
  (
    readContentJson("license-calendar-events.json") as {
      licenseCalendarEvents: LicenseEventType[];
    }
  ).licenseCalendarEvents;

export const loadLicenseReinstatements = (): AnytimeActionLicenseReinstatement[] =>
  (
    readContentJson("license-reinstatements.json") as {
      licenseReinstatements: AnytimeActionLicenseReinstatement[];
    }
  ).licenseReinstatements;

export const loadLicenses = (): License[] =>
  (readContentJson("licenses.json") as { licenses: License[] }).licenses;

export const loadPages = (): PageItem[] => readMarkdownDirectory<PageItem>("pages");

export const loadPageBySlug = (slug: string): PageItem => readMarkdownFile<PageItem>("pages", slug);

export const loadRecents = (): RecentItem[] =>
  readMarkdownDirectory<RecentItem>("recents").filter((recent) => recent.status === "Published");

export const loadFaqs = (): FaqItem[] => readMarkdownDirectory<FaqItem>("faqs");

export const loadCategories = (): CategoryItem[] => readJsonDirectory<CategoryItem>("categories");

export const loadSubCategories = (): SubCategoryItem[] =>
  readJsonDirectory<SubCategoryItem>("sub-categories");
