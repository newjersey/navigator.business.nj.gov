/**
 * Generates the Pagefind search index from typed static-site content.
 */

import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PagefindIndex } from "pagefind";

import { loadFundings, loadPageBySlug } from "./domain/content/loadContent";
import type { AppLocale } from "./domain/i18n/locales";
import { APP_LOCALES } from "./domain/i18n/locales";
import { loadLandingContentFromMessages } from "./domain/landing/loadLandingContent";
import {
  buildSearchIndexPages,
  renderSearchIndexHtml,
  type SearchIndexPage,
} from "./domain/search/buildSearchIndexPages";

/**
 * Writes an informational script log entry.
 */
export type LogInfo = (params: LogInfoParams) => void;

/**
 * Writes an error script log entry.
 */
export type LogError = (params: LogErrorParams) => void;

/**
 * Describes the script logger dependency.
 */
export interface ScriptLogger {
  /** Writes normal progress information. */
  readonly info: LogInfo;
  /** Writes failure information with original error context. */
  readonly error: LogError;
}

/**
 * Describes input for an informational log entry.
 */
export interface LogInfoParams {
  /** Message to write to stdout. */
  readonly message: string;
}

/**
 * Describes input for an error log entry.
 */
export interface LogErrorParams {
  /** Message to write before the formatted error. */
  readonly message: string;
  /** Original error value caught at the script boundary. */
  readonly error: unknown;
}

/**
 * Describes input for formatting an unknown error value.
 */
interface FormatUnknownErrorParams {
  /** Original error value to format for stderr. */
  readonly error: unknown;
}

/**
 * Describes input for creating a Pagefind index.
 */
interface CreateSearchIndexParams {
  /** Logger used for progress output. */
  readonly logger: ScriptLogger;
}

/**
 * Describes input for checking Pagefind errors.
 */
interface AssertNoPagefindErrorsParams {
  /** Operation name included in thrown error context. */
  readonly operation: string;
  /** Pagefind error messages returned by the Node API. */
  readonly errors: readonly string[];
}

/**
 * Describes input for adding a generated page to Pagefind.
 */
interface AddPageToSearchIndexParams {
  /** Pagefind index instance receiving generated pages. */
  readonly index: PagefindIndex;
  /** Synthetic HTML page generated from typed content. */
  readonly page: SearchIndexPage;
}

/**
 * Describes input for writing the generated Pagefind bundle.
 */
interface WriteSearchIndexParams {
  /** Pagefind index instance to write. */
  readonly index: PagefindIndex;
  /** Public output directory for the generated Pagefind bundle. */
  readonly outputDirectory: string;
}

/**
 * Describes input for building the search index.
 */
interface BuildSearchIndexParams {
  /** Logger used for script progress and failure output. */
  readonly logger: ScriptLogger;
  /** Public output directory for the generated Pagefind bundle. */
  readonly outputDirectory: string;
}

/**
 * Generated Pagefind Node API module.
 */
type PagefindModule = typeof import("pagefind");

/**
 * Describes input for loading generated search-index pages for one locale.
 */
interface LoadSearchIndexPagesForLocaleParams {
  /** Locale used to select localized messages and build URLs. */
  readonly locale: AppLocale;
}

/**
 * Describes input for loading every generated search-index page.
 */
interface LoadSearchIndexPagesParams {
  /** Supported locales to include in the search index. */
  readonly locales: readonly AppLocale[];
}

/**
 * Describes input for loading pages for one locale value.
 */
interface LoadSearchIndexPagesForLocaleValueParams {
  /** Locale value from the configured supported locale list. */
  readonly locale: AppLocale;
}

/**
 * Absolute path for this script file.
 */
const CURRENT_MODULE_FILE_PATH = fileURLToPath(import.meta.url);

/**
 * Absolute path for the static-site package root.
 */
const PROJECT_ROOT_DIRECTORY = path.dirname(CURRENT_MODULE_FILE_PATH);

/**
 * Public Pagefind bundle directory served by Next.js.
 */
const PAGEFIND_PUBLIC_DIRECTORY = path.join(PROJECT_ROOT_DIRECTORY, "public", "pagefind");

/**
 * CMS page slug currently rendered by a static-site route.
 */
const BUSINESS_NAMES_PAGE_SLUG = "business-names";

/**
 * Lazily loaded Pagefind module.
 */
let loadedPagefindModule: PagefindModule | undefined;

/**
 * Writes an informational message to stdout.
 *
 * @param params Log input.
 * @param params.message Message to write.
 * @example
 * ```ts
 * writeInfo({ message: "Generated search index" });
 * ```
 */
const writeInfo: LogInfo = ({ message }) => {
  process.stdout.write(`${message}\n`);
};

/**
 * Formats an unknown error value for script output.
 *
 * @param params Format input.
 * @param params.error Error value to format for stderr.
 * @returns A readable error message with stack details when available.
 * @example
 * ```ts
 * const formattedError = formatUnknownError({ error });
 * ```
 */
const formatUnknownError = ({ error }: FormatUnknownErrorParams): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack ?? "No stack available"}`;
  }

  return `Non-Error rejection: ${String(error)}`;
};

/**
 * Writes an error message and formatted error to stderr.
 *
 * @param params Log input.
 * @param params.message Message to write before the formatted error.
 * @param params.error Error value to format.
 * @example
 * ```ts
 * writeError({ message: "Failed", error });
 * ```
 */
const writeError: LogError = ({ message, error }) => {
  process.stderr.write(`${message}\n${formatUnknownError({ error })}\n`);
};

/**
 * Creates the process-backed script logger.
 *
 * @returns Logger implementation for this script entry point.
 * @example
 * ```ts
 * const logger = createProcessLogger();
 * ```
 */
const createProcessLogger = (): ScriptLogger => {
  return {
    info: writeInfo,
    error: writeError,
  };
};

/**
 * Loads Pagefind through dynamic import so the CommonJS script runner can use
 * Pagefind's ESM-only package entry point.
 */
const loadPagefindModule = async (): Promise<PagefindModule> => {
  loadedPagefindModule ??= await import("pagefind");

  return loadedPagefindModule;
};

/**
 * Throws when a Pagefind operation reports errors.
 */
const assertNoPagefindErrors = ({ operation, errors }: AssertNoPagefindErrorsParams): void => {
  if (errors.length > 0) {
    throw new Error(`${operation} failed: ${errors.join("; ")}`);
  }
};

/**
 * Creates a Pagefind index instance.
 */
const createSearchIndex = async ({ logger }: CreateSearchIndexParams): Promise<PagefindIndex> => {
  logger.info({ message: "Creating Pagefind search index." });

  const pagefind = await loadPagefindModule();
  const { errors, index } = await pagefind.createIndex({
    writePlayground: false,
  });

  assertNoPagefindErrors({ operation: "Creating Pagefind search index", errors });

  if (!index) {
    throw new Error("Creating Pagefind search index failed: missing index instance.");
  }

  return index;
};

/**
 * Loads generated search-index pages for one locale.
 */
const loadSearchIndexPagesForLocale = async ({
  locale,
}: LoadSearchIndexPagesForLocaleParams): Promise<readonly SearchIndexPage[]> => {
  const loadedLandingContent = await loadLandingContentFromMessages({ locale });
  const businessNamesPage = loadPageBySlug(BUSINESS_NAMES_PAGE_SLUG);
  const fundings = loadFundings();

  return buildSearchIndexPages({
    locale,
    loadedLandingContent,
    businessNamesPage,
    fundings,
  });
};

/**
 * Adapts a locale value to the parameter object expected by the locale loader.
 */
const loadSearchIndexPagesForLocaleValue = async ({
  locale,
}: LoadSearchIndexPagesForLocaleValueParams): Promise<readonly SearchIndexPage[]> => {
  return loadSearchIndexPagesForLocale({ locale });
};

/**
 * Loads generated search-index pages for every supported locale.
 */
const loadSearchIndexPages = async ({
  locales,
}: LoadSearchIndexPagesParams): Promise<readonly SearchIndexPage[]> => {
  const pageGroupPromises = locales.map((locale) => {
    return loadSearchIndexPagesForLocaleValue({ locale });
  });
  const pageGroups = await Promise.all(pageGroupPromises);

  return pageGroups.flat();
};

/**
 * Adds one generated page to the Pagefind index.
 */
const addPageToSearchIndex = async ({ index, page }: AddPageToSearchIndexParams): Promise<void> => {
  const { errors } = await index.addHTMLFile({
    url: page.url,
    content: renderSearchIndexHtml({ page }),
  });

  assertNoPagefindErrors({ operation: `Indexing ${page.url}`, errors });
};

/**
 * Writes generated Pagefind files into the public directory.
 */
const writeSearchIndex = async ({
  index,
  outputDirectory,
}: WriteSearchIndexParams): Promise<void> => {
  await rm(outputDirectory, { recursive: true, force: true });

  const { errors } = await index.writeFiles({
    outputPath: outputDirectory,
  });

  assertNoPagefindErrors({ operation: "Writing Pagefind search index", errors });
};

/**
 * Builds the Pagefind bundle for the current static-site content.
 *
 * @param params Build input.
 * @param params.logger Logger used for progress and failure output.
 * @param params.outputDirectory Public output directory for Pagefind files.
 * @returns A promise that resolves when the index has been written.
 * @example
 * ```ts
 * await buildSearchIndex({ logger, outputDirectory: "public/pagefind" });
 * ```
 */
const buildSearchIndex = async ({
  logger,
  outputDirectory,
}: BuildSearchIndexParams): Promise<void> => {
  const index = await createSearchIndex({ logger });
  const pages = await loadSearchIndexPages({ locales: APP_LOCALES });
  const indexingPromises = pages.map((page) => {
    return addPageToSearchIndex({ index, page });
  });

  await Promise.all(indexingPromises);
  await writeSearchIndex({ index, outputDirectory });
  logger.info({ message: `Generated Pagefind search index for ${pages.length} pages.` });
};

/**
 * Runs the script entry point and reports failures.
 *
 * @returns A promise that resolves after script completion.
 * @example
 * ```ts
 * await main();
 * ```
 */
const main = async (): Promise<void> => {
  const logger = createProcessLogger();

  try {
    await buildSearchIndex({
      logger,
      outputDirectory: PAGEFIND_PUBLIC_DIRECTORY,
    });
  } catch (error) {
    logger.error({ message: "Failed to build Pagefind search index.", error });
    process.exitCode = 1;
  } finally {
    try {
      if (loadedPagefindModule) {
        await loadedPagefindModule.close();
      }
    } catch (error) {
      logger.error({ message: "Failed to close Pagefind search index.", error });
      process.exitCode = 1;
    }
  }
};

void main();
