import cmsMapJson from "@/lib/cms/CollectionMap.json";
import { AddOn, TaskModification } from "@/lib/roadmap/roadmapBuilder";
import { loadTaskDependenciesFile } from "@businessnjgovnavigator/shared/static";
import { CMSMap, IndustryRoadmap, TaskDependencies } from "@businessnjgovnavigator/shared/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const roadmapsDir = path.join(process.cwd(), "..", "content", "src", "roadmaps");
const displayContentDir = path.join(process.cwd(), "..", "content", "src", "display-content");
const filingsDir = path.join(process.cwd(), "..", "content", "src", "filings");
const tasksDir = path.join(roadmapsDir, "tasks");
const licenseTasksDir = path.join(roadmapsDir, "license-tasks");
const industriesDir = path.join(roadmapsDir, "industries");
const addOnsDir = path.join(roadmapsDir, "add-ons");
const contextualInfoDir = path.join(displayContentDir, "contextual-information");
const fieldConfigDir = path.join(process.cwd(), "..", "content", "src", "fieldConfig");
const fundingsDir = path.join(process.cwd(), "..", "content", "src", "fundings");
const certificationsDir = path.join(process.cwd(), "..", "content", "src", "certifications");
const licensesDir = path.join(process.cwd(), "..", "content", "src", "license-calendar-events");
const anytimeActionTasksDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks",
);
const anytimeActionLicenseReinstatementsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-license-reinstatements",
);

type Filenames = {
  tasks: string[];
  industries: string[];
  filings: string[];
  addOns: string[];
  contextualInfos: string[];
  displayContents: string[];
  fieldConfigs: string[];
  fundings: string[];
  certifications: string[];
  licenses: string[];
  licenseTasks: string[];
  anytimeActionTasks: string[];
  anytimeActionLicenseReinstatements: string[];
};

type FileContents = {
  tasks: string[];
  licenseTasks: string[];
  industries: Array<IndustryRoadmap>;
  addOns: Array<AddOn[]>;
  modifications: Array<TaskModification[]>;
  contextualInfos: string[];
  displayContents: string[];
  fieldConfigs: string[];
};

const getFlattenedFilenames = (dir: string): string[] => {
  const allItems = fs.readdirSync(dir);
  let paths: string[] = [];
  for (const item of allItems) {
    const components = item.split(".");
    const isDirectory = components.length === 1;
    if (isDirectory) {
      paths = [...paths, ...getFlattenedFilenames(path.join(dir, components[0]))];
    } else {
      paths.push(path.join(dir, item));
    }
  }
  return paths;
};

const getFilenames = (): Filenames => {
  return {
    tasks: fs.readdirSync(tasksDir),
    industries: fs.readdirSync(industriesDir),
    filings: fs.readdirSync(filingsDir),
    addOns: fs.readdirSync(addOnsDir),
    contextualInfos: fs.readdirSync(contextualInfoDir),
    displayContents: getFlattenedFilenames(displayContentDir).filter((it) => {
      return it.endsWith(".md");
    }),
    fieldConfigs: fs.readdirSync(fieldConfigDir),
    fundings: fs.readdirSync(fundingsDir),
    certifications: fs.readdirSync(certificationsDir),
    licenses: fs.readdirSync(licensesDir),
    licenseTasks: fs.readdirSync(licenseTasksDir),
    anytimeActionTasks: fs.readdirSync(anytimeActionTasksDir),
    anytimeActionLicenseReinstatements: fs.readdirSync(anytimeActionLicenseReinstatementsDir),
  };
};

const getContents = (filenames: Filenames): FileContents => {
  const industries = filenames.industries.map((it) => {
    return JSON.parse(
      fs.readFileSync(path.join(roadmapsDir, "industries", it), "utf8"),
    ) as IndustryRoadmap;
  });
  const addOns = filenames.addOns.map((it) => {
    return JSON.parse(
      fs.readFileSync(path.join(roadmapsDir, "add-ons", it), "utf8"),
    ) as IndustryRoadmap;
  });
  const fieldConfigs = filenames.fieldConfigs.map((it) => {
    return fs.readFileSync(path.join(fieldConfigDir, it), "utf8");
  });

  return {
    tasks: filenames.tasks.map((it) => {
      return matter(fs.readFileSync(path.join(roadmapsDir, "tasks", it), "utf8")).content;
    }),
    licenseTasks: filenames.licenseTasks.map((it) => {
      return matter(fs.readFileSync(path.join(roadmapsDir, "license-tasks", it), "utf8")).content;
    }),
    industries,
    addOns: addOns.map((i) => {
      return i.roadmapSteps;
    }),
    modifications: [
      ...industries.map((i) => {
        return i.modifications;
      }),
      ...addOns.map((i) => {
        return i.modifications;
      }),
    ],
    contextualInfos: filenames.contextualInfos.map((it) => {
      return matter(
        fs.readFileSync(path.join(displayContentDir, "contextual-information", it), "utf8"),
      ).content;
    }),
    displayContents: filenames.displayContents.map((it) => {
      return matter(fs.readFileSync(it, "utf8")).content;
    }),
    fieldConfigs,
  };
};

const isReferencedInAMarkdown = async (
  contextualInfoFilename: string,
  markdowns: string[],
): Promise<boolean> => {
  let contained = false;
  const contextualInfoId = contextualInfoFilename.split(".md")[0];
  for (const content of markdowns) {
    const regexStr = `\`.*\\|${contextualInfoId}\``;
    if (new RegExp(regexStr).test(content)) {
      contained = true;
      break;
    }
  }
  return contained;
};

const isReferencedInConfig = async (
  contextualInfoFilename: string,
  configs: string[],
): Promise<boolean> => {
  let contained = false;
  const contextualInfoId = contextualInfoFilename.split(".md")[0];
  for (const content of configs) {
    const regexStr = `\`.*\\|${contextualInfoId}\``;
    if (new RegExp(regexStr).test(content)) {
      contained = true;
      break;
    }
  }
  return contained;
};

const isReferencedInARoadmap = async (
  filename: string,
  contents: FileContents,
): Promise<boolean> => {
  let containedInAnAddOn = false;
  let containedInAModification = false;
  const filenameWithoutMd = filename.split(".md")[0];

  for (const industry of contents.industries) {
    if (
      industry.roadmapSteps.some((it) => {
        return it.task === filenameWithoutMd || it.licenseTask === filenameWithoutMd;
      })
    ) {
      containedInAnAddOn = true;
      break;
    }
  }

  for (const industry of contents.industries) {
    if (
      industry.modifications &&
      industry.modifications.some((it) => {
        return it.replaceWithFilename === filenameWithoutMd;
      })
    ) {
      containedInAModification = true;
      break;
    }
  }

  for (const addOn of contents.addOns) {
    if (
      addOn.some((it) => {
        return it.task === filenameWithoutMd || it.licenseTask === filenameWithoutMd;
      })
    ) {
      containedInAnAddOn = true;
      break;
    }
  }

  for (const modification of contents.modifications) {
    if (
      modification &&
      modification.some((it) => {
        return it.replaceWithFilename === filenameWithoutMd;
      })
    ) {
      containedInAModification = true;
      break;
    }
  }

  return containedInAModification || containedInAnAddOn;
};

const isReferencedInTaskDependencies = (filename: string): boolean => {
  const filenameWithoutMd = filename.split(".md")[0];

  const taskDependencies = loadTaskDependenciesFile().dependencies as unknown as TaskDependencies[];
  for (const dependency of taskDependencies) {
    if (dependency.task && dependency.task === filenameWithoutMd) {
      return true;
    }
    if (dependency.licenseTask && dependency.licenseTask === filenameWithoutMd) {
      return true;
    }
    if (dependency.taskDependencies) {
      for (const taskDependency of dependency.taskDependencies) {
        if (taskDependency === filenameWithoutMd) {
          return true;
        }
      }
    }
    if (dependency.licenseTaskDependencies) {
      for (const licenseTaskDependency of dependency.licenseTaskDependencies) {
        if (licenseTaskDependency === filenameWithoutMd) {
          return true;
        }
      }
    }
  }
  return false;
};

export const findDeadTasks = async (): Promise<string[]> => {
  const deadTasks = [];
  const filenames = getFilenames();
  const contents = getContents(filenames);
  for (const taskFilename of filenames.tasks) {
    if (!(await isReferencedInARoadmap(taskFilename, contents))) {
      if (isReferencedInTaskDependencies(taskFilename)) {
        deadTasks.push(`${taskFilename} (only used in task dependencies)`);
      } else {
        deadTasks.push(taskFilename);
      }
    }
  }
  return deadTasks;
};

export const findDeadLicenseTasks = async (): Promise<string[]> => {
  const deadTasks = [];
  const filenames = getFilenames();
  const contents = getContents(filenames);
  for (const licenseTaskFilename of filenames.licenseTasks) {
    if (!(await isReferencedInARoadmap(licenseTaskFilename, contents))) {
      if (isReferencedInTaskDependencies(licenseTaskFilename)) {
        deadTasks.push(`${licenseTaskFilename} (only used in task dependencies)`);
      } else {
        deadTasks.push(licenseTaskFilename);
      }
    }
  }
  return deadTasks;
};

export type LinkCategory = "dead" | "inconclusive" | "serverError" | "httpsOnly";

export type FoundUrl = {
  url: string;
  field: string;
  context: string;
  statusCode?: number | null;
  statusText?: string;
  category?: LinkCategory;
};

export type ContentDeadLink = {
  file: string;
  slug: string;
  displayName: string;
  collection: string;
  cmsEditUrl: string;
  pageUrl: string;
  deadUrls: FoundUrl[];
};

const CONTENT_DIRS_TO_SCAN = [
  "anytime-action-categories",
  "anytime-action-license-reinstatements",
  "anytime-action-tasks",
  "certifications",
  "categories",
  "covids",
  "display-content",
  "faqs",
  "fieldConfig",
  "filings",
  "fundings",
  "license-calendar-events",
  "mappings",
  "page-metadata",
  "pages",
  "recents",
  "renewal-calendar-events",
  "roadmaps/tasks",
  "roadmaps/license-tasks",
  "roadmaps/municipal-tasks",
  "roadmaps/raffle-bingo-steps",
  "sub-categories",
  "tropical-storm-ida",
  "webflow-licenses",
];

const TEMPLATE_VARS = [
  "municipalityWebsite",
  "municipality",
  "county",
  "countyClerkPhone",
  "countyClerkWebsite",
];

const KNOWN_FALSE_POSITIVES = new Set(["https://www.facebook.com/BusinessNJgov"]);

const URL_REGEX = /https?:\/\/[^\s"')<>[\]]+/g;

const getContextSnippet = (text: string, url: string): string => {
  const index = text.indexOf(url);
  if (index === -1) return url;
  const snippetRadius = 40;
  const start = Math.max(0, index - snippetRadius);
  const end = Math.min(text.length, index + url.length + snippetRadius);
  let snippet = text.slice(start, end).replaceAll("\n", " ");
  if (start > 0) snippet = `...${snippet}`;
  if (end < text.length) snippet = `${snippet}...`;
  return snippet;
};

const markdownParser = unified().use(remarkParse);

const extractUrlsFromText = (text: string, fieldName: string): FoundUrl[] => {
  const tree = markdownParser.parse(text);
  const seen = new Set<string>();
  const results: FoundUrl[] = [];

  visit(tree, "link", (node: { url: string }) => {
    const url = node.url;
    if (/^https?:\/\//.test(url) && !seen.has(url)) {
      seen.add(url);
      results.push({ url, field: fieldName, context: getContextSnippet(text, url) });
    }
  });

  const rawRegex = new RegExp(URL_REGEX.source, "g");
  let match;
  while ((match = rawRegex.exec(text)) !== null) {
    const url = match[0].replace(/[!),.:;?]+$/, "");
    if (seen.has(url)) continue;
    let isSubstringOfKnown = false;
    for (const seenUrl of seen) {
      if (seenUrl.includes(url)) {
        isSubstringOfKnown = true;
        break;
      }
    }
    if (isSubstringOfKnown) continue;
    seen.add(url);
    results.push({ url, field: fieldName, context: getContextSnippet(text, url) });
  }

  return results;
};

const extractUrlsFromJsonValue = (obj: unknown, fieldName: string): FoundUrl[] => {
  const results: FoundUrl[] = [];
  if (typeof obj === "string") {
    results.push(...extractUrlsFromText(obj, fieldName));
  } else if (Array.isArray(obj)) {
    for (const [i, element] of obj.entries()) {
      results.push(...extractUrlsFromJsonValue(element, `${fieldName}[${i}]`));
    }
  } else if (obj !== null && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      results.push(...extractUrlsFromJsonValue(value, key));
    }
  }
  return results;
};

const extractUrlsFromFile = (filePath: string): FoundUrl[] => {
  const content = fs.readFileSync(filePath, "utf8");
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".json") {
    try {
      return extractUrlsFromJsonValue(JSON.parse(content), "root");
    } catch {
      return [];
    }
  }

  if (ext === ".md") {
    const { data: frontmatter, content: body } = matter(content);
    const results: FoundUrl[] = [];
    for (const [key, value] of Object.entries(frontmatter)) {
      results.push(...extractUrlsFromJsonValue(value, key));
    }
    results.push(...extractUrlsFromText(body, "body"));
    const seen = new Set<string>();
    return results.filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });
  }

  return [];
};

const isTemplateUrl = (url: string): boolean => {
  return url.startsWith("$") && TEMPLATE_VARS.some((v) => url.includes(v));
};

const getCmsEditUrl = (slug: string): string => {
  const cmsMap: CMSMap = cmsMapJson;
  const entry = cmsMap[slug];
  if (!entry) return "";
  const collectionName = Object.values(entry)[0];
  return `/mgmt/cms#/collections/${collectionName}/entries/${slug}`;
};

const getCmsCollectionLabel = (slug: string): string => {
  const cmsMap: CMSMap = cmsMapJson;
  const entry = cmsMap[slug];
  if (!entry) return "Unknown";
  return Object.keys(entry)[0];
};

const COLLECTION_ROUTE_MAP: Record<string, string> = {
  "Tasks - ABC": "/tasks",
  "Tasks - All (option to map to Webflow/static site)": "/tasks",
  "Tasks - Business Structure": "/tasks",
  "Tasks - Cannabis License": "/tasks",
  "Tasks - Cannabis Priority Status": "/tasks",
  "Tasks - Cigarette License": "/tasks",
  "Tasks - EIN": "/tasks",
  "Tasks - Manage Business Vehicles": "/tasks",
  "Tasks - Municipal": "/tasks",
  "Tasks - NAICS Code": "/tasks",
  "Tasks - Passenger Transport CDL": "/tasks",
  "Tasks - Tax ID": "/tasks",
  "License Tasks (Navigator with Webflow mappings)": "/tasks",
  "Raffle Bingo Steps": "/tasks",
  "Fund Opps - Content": "/funding",
  "Cert Opps - Content": "/certification",
  "Taxes Filings - All": "/filings",
  "Anytime Actions Tasks": "/actions",
  "Consumer Affairs License Expiration / Renewal Events": "/license-calendar-event",
  "Anytime Action With Consumer Affairs License Integrations (Reinstatements)":
    "/license-reinstatement",
};

const getPageUrl = (slug: string, collection: string, filePath: string): string => {
  const routeBase = COLLECTION_ROUTE_MAP[collection];
  if (!routeBase) return "";
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { data } = matter(content);
    const urlSlug = data.urlSlug || slug;
    return `${routeBase}/${urlSlug}`;
  } catch {
    return `${routeBase}/${slug}`;
  }
};

const getDisplayName = (slug: string, filePath: string): string => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".md") {
      const { data } = matter(content);
      return data.name || data.displayname || data["category-name"] || slug;
    }
    if (ext === ".json") {
      const parsed = JSON.parse(content);
      return parsed.name || parsed.displayname || slug;
    }
  } catch {
    // fall through
  }
  return slug;
};

const collectContentFiles = (): { filePath: string; slug: string }[] => {
  const contentBase = path.join(process.cwd(), "..", "content", "src");
  const files: { filePath: string; slug: string }[] = [];

  for (const dir of CONTENT_DIRS_TO_SCAN) {
    const dirPath = path.join(contentBase, dir);
    if (!fs.existsSync(dirPath)) continue;
    const allFiles = getFlattenedFilenames(dirPath);
    for (const filePath of allFiles) {
      const ext = path.extname(filePath).toLowerCase();
      if (ext !== ".md" && ext !== ".json") continue;
      const slug = path.basename(filePath, ext);
      files.push({ filePath, slug });
    }
  }

  return files;
};

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type HttpResponse = {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
};

const fetchWithTimeout = async (url: string, method: string): Promise<HttpResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": BROWSER_UA },
    });
  } finally {
    clearTimeout(timeout);
  }
};

const MAX_RATE_LIMIT_RETRIES = 2;
const DEFAULT_RETRY_AFTER_SECONDS = 5;
const MAX_RETRY_AFTER_SECONDS = 30;

// Retry-After may also be an HTTP date; those fall back to the default wait.
const getRetryDelayMs = (response: HttpResponse): number => {
  const header = response.headers.get("retry-after");
  const seconds = header === null ? Number.NaN : Number(header);
  const delay = Number.isFinite(seconds) && seconds >= 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS;
  return Math.min(delay, MAX_RETRY_AFTER_SECONDS) * 1000;
};

const fetchRetryingRateLimits = async (url: string, method: string): Promise<HttpResponse> => {
  let response = await fetchWithTimeout(url, method);
  for (let retry = 0; retry < MAX_RATE_LIMIT_RETRIES && response.status === 429; retry++) {
    await new Promise((resolve) => setTimeout(resolve, getRetryDelayMs(response)));
    response = await fetchWithTimeout(url, method);
  }
  return response;
};

const MAX_REDIRECTS = 10;

type FetchOutcome =
  | {
      kind: "response";
      response: HttpResponse;
      firstRedirect?: { status: number; location: string };
    }
  | { kind: "redirectLoop" };

const fetchFollowingRedirects = async (url: string, method: string): Promise<FetchOutcome> => {
  let currentUrl = url;
  let firstRedirect: { status: number; location: string } | undefined;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetchRetryingRateLimits(currentUrl, method);
    const isRedirect = response.status >= 300 && response.status < 400;
    const location = isRedirect ? response.headers.get("location") : null;
    if (!location) return { kind: "response", response, firstRedirect };
    currentUrl = new URL(location, currentUrl).toString();
    firstRedirect ??= { status: response.status, location: currentUrl };
  }
  return { kind: "redirectLoop" };
};

type UrlCheckResult = {
  alive: boolean;
  statusCode: number | null;
  statusText: string;
  category?: LinkCategory;
  failedToConnect?: boolean;
};

const STATUS_TEXT: Record<number, string> = {
  301: "Moved Permanently",
  302: "Found",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  410: "Gone",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  521: "Web Server Is Down",
  522: "Connection Timed Out",
  523: "Origin Is Unreachable",
};

const getStatusText = (code: number): string => STATUS_TEXT[code] || `HTTP ${code}`;

// Only statuses that mean the resource is gone count as dead. Everything else (bot walls,
// rate limits, login pages) says more about the checker than the link.
const categorizeStatus = (code: number): LinkCategory => {
  if (code === 404 || code === 410) return "dead";
  if (code >= 500) return "serverError";
  return "inconclusive";
};

const getErrorCode = (error: unknown): string | undefined => {
  if (!(error instanceof Error)) return undefined;
  const cause: unknown = error.cause;
  if (typeof cause === "object" && cause !== null && "code" in cause) {
    return String(cause.code);
  }
  return undefined;
};

const describeConnectionError = (error: unknown): UrlCheckResult => {
  if (error instanceof Error && error.name === "AbortError") {
    return {
      alive: false,
      statusCode: null,
      statusText: "Timed Out",
      category: "inconclusive",
      failedToConnect: true,
    };
  }
  const code = getErrorCode(error);
  return {
    alive: false,
    statusCode: null,
    statusText: code ? `Connection Failed (${code})` : "Connection Failed",
    category: code === "ENOTFOUND" ? "dead" : "inconclusive",
    failedToConnect: true,
  };
};

const checkUrlOnce = async (url: string): Promise<UrlCheckResult> => {
  try {
    const head = await fetchFollowingRedirects(url, "HEAD");
    if (head.kind === "response" && head.response.ok) {
      return { alive: true, statusCode: head.response.status, statusText: "OK" };
    }
    const get = await fetchFollowingRedirects(url, "GET");
    if (get.kind === "redirectLoop") {
      return {
        alive: false,
        statusCode: null,
        statusText: "Redirect Loop",
        category: "inconclusive",
      };
    }
    const { response, firstRedirect } = get;
    if (response.ok) return { alive: true, statusCode: response.status, statusText: "OK" };

    const finalStatus = response.status;
    const statusText = firstRedirect
      ? `${getStatusText(firstRedirect.status)} → ${finalStatus} ${getStatusText(finalStatus)} (${firstRedirect.location})`
      : getStatusText(finalStatus);

    return {
      alive: false,
      statusCode: firstRedirect ? firstRedirect.status : finalStatus,
      statusText,
      category: categorizeStatus(finalStatus),
    };
  } catch (error) {
    return describeConnectionError(error);
  }
};

// Some networks block or intercept plain http, which made every http:// link look dead.
// Retrying over https separates those from links that are actually gone.
const checkUrl = async (url: string): Promise<UrlCheckResult> => {
  const result = await checkUrlOnce(url);
  if (!result.failedToConnect || !url.startsWith("http://")) return result;

  const httpsResult = await checkUrlOnce(url.replace(/^http:/, "https:"));
  if (httpsResult.alive) {
    return {
      alive: false,
      statusCode: null,
      statusText: "Unreachable over http; works over https",
      category: "httpsOnly",
    };
  }
  if (httpsResult.failedToConnect) return result;
  return { ...httpsResult, statusText: `${httpsResult.statusText} (checked over https)` };
};

const PARALLEL_HOSTS = 15;

const getHostKey = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// Hitting one host with many concurrent requests gets us rate limited (429), which hides the
// real status. Each host's URLs are checked one at a time; different hosts run in parallel.
const checkUrlsOneAtATimePerHost = async (
  urls: string[],
  onChecked: (url: string, result: UrlCheckResult) => void,
): Promise<void> => {
  const urlsByHost = new Map<string, string[]>();
  for (const url of urls) {
    const host = getHostKey(url);
    urlsByHost.set(host, [...(urlsByHost.get(host) ?? []), url]);
  }
  const hostQueues = [...urlsByHost.values()];

  const checkNextHosts = async (): Promise<void> => {
    for (let queue = hostQueues.shift(); queue; queue = hostQueues.shift()) {
      for (const url of queue) {
        onChecked(url, await checkUrl(url));
      }
    }
  };
  await Promise.all(Array.from({ length: PARALLEL_HOSTS }, checkNextHosts));
};

export const findDeadContentLinks = async (
  onProgress?: (checkedUrls: number, totalUrls: number) => void,
): Promise<ContentDeadLink[]> => {
  const files = collectContentFiles();
  console.log(`[deadlinks] Found ${files.length} content files to scan`);

  const fileData: { filePath: string; slug: string; foundUrls: FoundUrl[] }[] = [];
  let totalRawUrls = 0;
  let skippedTemplate = 0;
  let skippedFalsePositive = 0;

  for (const { filePath, slug } of files) {
    const rawUrls = extractUrlsFromFile(filePath);
    totalRawUrls += rawUrls.length;
    const filtered = rawUrls.filter((u) => {
      if (isTemplateUrl(u.url)) {
        skippedTemplate++;
        return false;
      }
      if (KNOWN_FALSE_POSITIVES.has(u.url)) {
        skippedFalsePositive++;
        return false;
      }
      return true;
    });
    if (filtered.length > 0) {
      fileData.push({ filePath, slug, foundUrls: filtered });
    }
  }

  const allUniqueUrls = [...new Set(fileData.flatMap((f) => f.foundUrls.map((u) => u.url)))];
  console.log(
    `[deadlinks] Extracted ${totalRawUrls} URLs total, ${allUniqueUrls.length} unique to check ` +
      `(skipped ${skippedTemplate} template, ${skippedFalsePositive} false positive)`,
  );

  const urlStatus = new Map<string, UrlCheckResult>();
  let checked = 0;

  await checkUrlsOneAtATimePerHost(allUniqueUrls, (url, result) => {
    urlStatus.set(url, result);
    checked++;
    if (!result.alive) {
      console.log(`[deadlinks] ${result.statusText}: ${url}`);
    }
    if (checked % 50 === 0 || checked === allUniqueUrls.length) {
      console.log(`[deadlinks] Checked ${checked}/${allUniqueUrls.length} URLs`);
    }
    onProgress?.(checked, allUniqueUrls.length);
  });

  const results: ContentDeadLink[] = [];
  for (const { filePath, slug, foundUrls } of fileData) {
    const deadUrls = foundUrls
      .filter((u) => urlStatus.get(u.url)?.alive === false)
      .map((u) => {
        const status = urlStatus.get(u.url);
        return {
          ...u,
          statusCode: status?.statusCode ?? null,
          statusText: status?.statusText ?? "Unknown",
          category: status?.category,
        };
      });
    if (deadUrls.length > 0) {
      const collection = getCmsCollectionLabel(slug);
      results.push({
        file: filePath,
        slug,
        displayName: getDisplayName(slug, filePath),
        collection,
        cmsEditUrl: getCmsEditUrl(slug),
        pageUrl: getPageUrl(slug, collection, filePath),
        deadUrls,
      });
    }
  }

  const totalDead = results.reduce((sum, r) => sum + r.deadUrls.length, 0);
  console.log(
    `[deadlinks] Complete: ${totalDead} dead URLs across ${results.length} content items`,
  );

  return results;
};

export const findDeadContextualInfo = async (): Promise<string[]> => {
  const deadContextualInfos = [];
  const filenames = getFilenames();
  const contents = getContents(filenames);
  for (const contextualInfo of filenames.contextualInfos) {
    if (
      !(
        (await isReferencedInAMarkdown(contextualInfo, contents.tasks)) ||
        (await isReferencedInAMarkdown(contextualInfo, contents.displayContents)) ||
        (await isReferencedInAMarkdown(contextualInfo, contents.contextualInfos)) ||
        (await isReferencedInConfig(contextualInfo, contents.fieldConfigs))
      )
    ) {
      deadContextualInfos.push(contextualInfo);
    }
  }
  return deadContextualInfos;
};
