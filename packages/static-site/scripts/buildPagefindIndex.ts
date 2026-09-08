/**
 * Builds the Pagefind search index as a `postbuild` step.
 *
 * `packages/static-site` builds with `output: "standalone"`, so `next build`
 * never writes complete `.html` files Pagefind's CLI could crawl from disk —
 * every locale-scoped route renders dynamically at request time. Instead,
 * this script boots the just-built standalone server locally, fetches every
 * indexable page's real rendered HTML over HTTP, and feeds it straight to
 * Pagefind's Node API. See `.scratch/static-site-search/research/
 * 01-pagefind-ssr-indexing.md` for the full investigation behind this
 * approach.
 */

import { type ChildProcess, spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import * as pagefind from "pagefind";
import { addLocalePrefix } from "@/domain/i18n/localePath";
import { type AppLocale, ENABLED_LOCALES } from "@/domain/i18n/locales";
import { collectRoutePathnames } from "@/domain/routes/collectRoutePathnames";
import { createProcessLogger, type ScriptLogger } from "./scriptLogger";

/**
 * Absolute path for this script file.
 */
const CURRENT_MODULE_FILE_PATH = fileURLToPath(import.meta.url);

/**
 * Absolute path for this script directory.
 */
const CURRENT_MODULE_DIRECTORY = path.dirname(CURRENT_MODULE_FILE_PATH);

/**
 * Root directory for the static-site package.
 */
const PROJECT_ROOT_DIRECTORY = path.resolve(CURRENT_MODULE_DIRECTORY, "..");

/**
 * Absolute path to the standalone server bundle `next build` produces.
 */
const STANDALONE_SERVER_SCRIPT_PATH = path.join(
  PROJECT_ROOT_DIRECTORY,
  ".next",
  "standalone",
  "server.js",
);

/**
 * Port the locally-booted standalone server listens on during indexing.
 *
 * Distinct from `pnpm dev`'s port (4000, `package.json`) so this script can
 * run alongside a dev server without colliding.
 */
const STANDALONE_SERVER_PORT = 4740;

/**
 * Host the locally-booted standalone server binds to during indexing.
 */
const STANDALONE_SERVER_HOSTNAME = "0.0.0.0";

/**
 * Existing health-check route polled to detect server readiness.
 */
const HEALTH_CHECK_PATH = "/healthz";

/**
 * Maximum readiness polling attempts before giving up.
 */
const HEALTH_CHECK_MAX_ATTEMPTS = 40;

/**
 * Delay between readiness polling attempts, in milliseconds.
 */
const HEALTH_CHECK_INTERVAL_MS = 250;

/**
 * Bounded wait for a graceful shutdown before force-killing the server.
 */
const SERVER_SHUTDOWN_GRACE_MS = 5000;

/**
 * Pagefind bundle output directory, relative to this package's root.
 *
 * Lands inside `public/`, so it rides along with the Dockerfile's existing
 * `COPY --from=builder .../app/public ./public` step with no Dockerfile edit.
 */
const PAGEFIND_OUTPUT_PATH = "public/pagefind";

/**
 * Maximum concurrent fetches issued against the local standalone server at
 * once.
 *
 * Observed empirically: firing every page fetch at once (unbounded
 * concurrency) against a single, just-started Node process intermittently
 * causes a handful of connections to fail under load, even though the
 * server is otherwise healthy. Capping concurrency avoids overwhelming the
 * single process this script itself just started.
 */
const MAX_CONCURRENT_FETCHES = 8;

/**
 * Maximum attempts for one page fetch before treating it as a real failure.
 */
const FETCH_MAX_ATTEMPTS = 3;

/**
 * Delay between retry attempts for one page fetch, in milliseconds.
 */
const FETCH_RETRY_DELAY_MS = 300;

/**
 * Describes one rendered page this script needs to fetch and index.
 */
interface TargetPath {
  /** Locale this pathname is rendered for. */
  readonly locale: AppLocale;
  /** Locale-prefixed request path (e.g. `/es-US/learn`, or `/learn` for the default locale). */
  readonly prefixedPath: string;
}

/**
 * Describes one page's fetched HTML, ready to hand to Pagefind.
 */
interface FetchedPage {
  /** Locale-prefixed request path this HTML was fetched from. */
  readonly prefixedPath: string;
  /** Full rendered HTML document. */
  readonly html: string;
}

/**
 * Describes a running standalone server instance available for fetching.
 */
interface StandaloneServerHandle {
  /** Origin the server is reachable at. */
  readonly baseUrl: string;
  /** Stops the server, forcing termination if it does not exit gracefully. */
  readonly stop: () => Promise<void>;
}

/**
 * Describes input for path existence validation.
 */
interface ValidatePathExistsParams {
  /** Filesystem path that must exist. */
  readonly filePath: string;
  /** Human-readable path purpose used in failure messages. */
  readonly description: string;
}

/**
 * Validates that one filesystem path exists.
 *
 * @param params Validation input.
 * @param params.filePath Filesystem path that must exist.
 * @param params.description Human-readable path purpose.
 * @throws {Error} Thrown when the path is missing.
 * @example
 * ```ts
 * await validatePathExists({ filePath: "/tmp/file", description: "temporary file" });
 * ```
 */
const validatePathExists = async ({
  filePath,
  description,
}: ValidatePathExistsParams): Promise<void> => {
  try {
    await stat(filePath);
  } catch (error) {
    throw new Error(`Missing ${description} at ${filePath}`, { cause: error });
  }
};

/**
 * Enumerates every locale-prefixed page this build needs to index.
 *
 * Reuses `collectRoutePathnames()` (the sitemap's own route list) and
 * `ENABLED_LOCALES` (the multilingual flag's resolved locale set), so this
 * script can never drift from the routes the app actually serves.
 *
 * @returns One target per (locale, pathname) combination.
 * @example
 * ```ts
 * const targetPaths = buildTargetPaths();
 * ```
 */
const buildTargetPaths = (): readonly TargetPath[] => {
  const pathnamesWithoutLocale = collectRoutePathnames();

  return ENABLED_LOCALES.flatMap((locale) =>
    pathnamesWithoutLocale.map((pathnameWithoutLocale) => ({
      locale,
      prefixedPath: addLocalePrefix({ pathnameWithoutLocale, locale }),
    })),
  );
};

/**
 * Describes input for waiting on standalone server readiness.
 */
interface WaitForServerReadyParams {
  /** Child process running the standalone server. */
  readonly child: ChildProcess;
  /** Health-check URL to poll. */
  readonly healthCheckUrl: string;
  /** Logger used for progress output. */
  readonly logger: ScriptLogger;
}

/**
 * Polls the standalone server's health-check route until it responds, or
 * fails fast if the server process exits first.
 *
 * @param params Readiness-wait input.
 * @param params.child Child process running the standalone server.
 * @param params.healthCheckUrl Health-check URL to poll.
 * @param params.logger Logger used for progress output.
 * @throws {Error} Thrown when the server exits early or never becomes healthy.
 * @example
 * ```ts
 * await waitForServerReady({ child, healthCheckUrl, logger });
 * ```
 */
const waitForServerReady = async ({
  child,
  healthCheckUrl,
  logger,
}: WaitForServerReadyParams): Promise<void> => {
  let exitedEarly: { code: number | null; signal: NodeJS.Signals | null } | undefined;
  const onExit = (code: number | null, signal: NodeJS.Signals | null): void => {
    exitedEarly = { code, signal };
  };
  child.once("exit", onExit);

  try {
    for (let attempt = 1; attempt <= HEALTH_CHECK_MAX_ATTEMPTS; attempt += 1) {
      if (exitedEarly) {
        throw new Error(
          `Standalone server exited before becoming healthy (code ${exitedEarly.code}, signal ${exitedEarly.signal}).`,
        );
      }

      try {
        const response = await fetch(healthCheckUrl);

        if (response.ok) {
          logger.info({ message: `Standalone server is healthy after ${attempt} attempt(s).` });

          return;
        }
      } catch {
        // Connection not accepted yet; retry after the interval below.
      }

      await sleep(HEALTH_CHECK_INTERVAL_MS);
    }

    throw new Error(
      `Standalone server did not become healthy within ${
        HEALTH_CHECK_MAX_ATTEMPTS * HEALTH_CHECK_INTERVAL_MS
      }ms (checked ${healthCheckUrl}).`,
    );
  } finally {
    child.off("exit", onExit);
  }
};

/**
 * Describes input for stopping the standalone server.
 */
interface StopStandaloneServerParams {
  /** Child process running the standalone server. */
  readonly child: ChildProcess;
}

/**
 * Stops the standalone server, escalating to a forced kill if it does not
 * exit gracefully within the shutdown grace period.
 *
 * @param params Shutdown input.
 * @param params.child Child process running the standalone server.
 * @returns A promise that resolves once the process has exited.
 * @example
 * ```ts
 * await stopStandaloneServer({ child });
 * ```
 */
const stopStandaloneServer = async ({ child }: StopStandaloneServerParams): Promise<void> => {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  const exited = new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
  });

  child.kill("SIGTERM");

  const timedOut = await Promise.race([
    exited.then(() => false),
    sleep(SERVER_SHUTDOWN_GRACE_MS).then(() => true),
  ]);

  if (timedOut) {
    child.kill("SIGKILL");
    await exited;
  }
};

/**
 * Describes input for starting the standalone server.
 */
interface StartStandaloneServerParams {
  /** Logger used for progress output. */
  readonly logger: ScriptLogger;
}

/**
 * Starts the just-built standalone server as a child process and waits for
 * it to become healthy.
 *
 * @param params Startup input.
 * @param params.logger Logger used for progress output.
 * @returns A handle for fetching pages from, and later stopping, the server.
 * @throws {Error} Thrown when the standalone bundle is missing, or the
 * server never becomes healthy.
 * @example
 * ```ts
 * const server = await startStandaloneServer({ logger });
 * ```
 */
const startStandaloneServer = async ({
  logger,
}: StartStandaloneServerParams): Promise<StandaloneServerHandle> => {
  await validatePathExists({
    filePath: STANDALONE_SERVER_SCRIPT_PATH,
    description: "Next.js standalone server bundle (run `pnpm build` first)",
  });

  logger.info({ message: `Starting standalone server: node ${STANDALONE_SERVER_SCRIPT_PATH}` });

  const child = spawn("node", [STANDALONE_SERVER_SCRIPT_PATH], {
    cwd: PROJECT_ROOT_DIRECTORY,
    env: {
      // biome-ignore lint/style/noProcessEnv: forwarding the real build environment to the child server process, plus this script's own port/host overrides.
      ...process.env,
      PORT: String(STANDALONE_SERVER_PORT),
      HOSTNAME: STANDALONE_SERVER_HOSTNAME,
    },
    stdio: "inherit",
  });

  const baseUrl = `http://localhost:${STANDALONE_SERVER_PORT}`;

  try {
    await waitForServerReady({
      child,
      healthCheckUrl: `${baseUrl}${HEALTH_CHECK_PATH}`,
      logger,
    });
  } catch (error) {
    // `waitForServerReady` throwing here means the process is still
    // running (just never became healthy) — every other failure path in
    // this file reaches `stopStandaloneServer` via `main()`'s own
    // `finally`, but a throw before this function returns a handle skips
    // that entirely, leaking a listener on `STANDALONE_SERVER_PORT`.
    await stopStandaloneServer({ child });
    throw error;
  }

  return {
    baseUrl,
    stop: () => stopStandaloneServer({ child }),
  };
};

/**
 * Describes input for mapping a list with bounded concurrency.
 */
interface MapWithConcurrencyLimitParams<TInput, TOutput> {
  /** Items to map. */
  readonly items: readonly TInput[];
  /** Maximum number of items processed at once. */
  readonly limit: number;
  /** Async mapper applied to each item. */
  readonly mapItem: (item: TInput) => Promise<TOutput>;
}

/**
 * Maps a list with at most `limit` mapper calls in flight at once,
 * collecting per-item success/failure like `Promise.allSettled` would.
 *
 * @param params Mapping input.
 * @param params.items Items to map.
 * @param params.limit Maximum number of items processed at once.
 * @param params.mapItem Async mapper applied to each item.
 * @returns One settled result per input item, in input order.
 * @example
 * ```ts
 * const results = await mapWithConcurrencyLimit({ items, limit: 8, mapItem });
 * ```
 */
const mapWithConcurrencyLimit = async <TInput, TOutput>({
  items,
  limit,
  mapItem,
}: MapWithConcurrencyLimitParams<TInput, TOutput>): Promise<
  readonly PromiseSettledResult<TOutput>[]
> => {
  const results: PromiseSettledResult<TOutput>[] = new Array(items.length);
  let nextIndex = 0;

  const runWorker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      try {
        results[currentIndex] = { status: "fulfilled", value: await mapItem(items[currentIndex]) };
      } catch (error) {
        results[currentIndex] = { status: "rejected", reason: error };
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runWorker()));

  return results;
};

/**
 * Describes input for fetching one target page's rendered HTML.
 */
interface FetchTargetPageParams {
  /** Origin the standalone server is reachable at. */
  readonly baseUrl: string;
  /** Page to fetch. */
  readonly targetPath: TargetPath;
}

/**
 * Fetches one target page's real rendered HTML from the standalone server,
 * once — no retry.
 *
 * @param params Fetch input.
 * @param params.baseUrl Origin the standalone server is reachable at.
 * @param params.targetPath Page to fetch.
 * @returns The fetched page's pathname and HTML.
 * @throws {Error} Thrown when the response is not successful.
 * @example
 * ```ts
 * const page = await fetchTargetPageOnce({ baseUrl, targetPath });
 * ```
 */
const fetchTargetPageOnce = async ({
  baseUrl,
  targetPath,
}: FetchTargetPageParams): Promise<FetchedPage> => {
  const response = await fetch(`${baseUrl}${targetPath.prefixedPath}`);

  if (!response.ok) {
    throw new Error(
      `Fetching ${targetPath.prefixedPath} (locale ${targetPath.locale}) returned HTTP ${response.status}.`,
    );
  }

  return { prefixedPath: targetPath.prefixedPath, html: await response.text() };
};

/**
 * Fetches one target page's rendered HTML, retrying transient failures.
 *
 * A locally-booted, just-started single Node process can intermittently
 * drop a connection under concurrent load even while otherwise healthy
 * (observed empirically); a bounded retry absorbs that without masking a
 * genuinely broken route, which will still fail after every attempt.
 *
 * @param params Fetch input.
 * @param params.baseUrl Origin the standalone server is reachable at.
 * @param params.targetPath Page to fetch.
 * @returns The fetched page's pathname and HTML.
 * @throws {Error} Thrown (as the final attempt's error) when every attempt fails.
 * @example
 * ```ts
 * const page = await fetchTargetPage({ baseUrl, targetPath });
 * ```
 */
const fetchTargetPage = async ({
  baseUrl,
  targetPath,
}: FetchTargetPageParams): Promise<FetchedPage> => {
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fetchTargetPageOnce({ baseUrl, targetPath });
    } catch (error) {
      if (attempt === FETCH_MAX_ATTEMPTS) {
        throw error;
      }

      await sleep(FETCH_RETRY_DELAY_MS);
    }
  }

  // Unreachable: the loop above always returns or throws.
  throw new Error(`Failed to fetch ${targetPath.prefixedPath}.`);
};

/**
 * Describes input for fetching every target page.
 */
interface FetchAllTargetPagesParams {
  /** Origin the standalone server is reachable at. */
  readonly baseUrl: string;
  /** Pages to fetch. */
  readonly targetPaths: readonly TargetPath[];
  /** Logger used for progress output. */
  readonly logger: ScriptLogger;
}

/**
 * Fetches every target page's rendered HTML, with bounded concurrency.
 *
 * @param params Fetch input.
 * @param params.baseUrl Origin the standalone server is reachable at.
 * @param params.targetPaths Pages to fetch.
 * @param params.logger Logger used for progress output.
 * @returns Every fetched page.
 * @throws {Error} Thrown with every failure's detail when any page fails to
 * fetch — nothing is silently skipped.
 * @example
 * ```ts
 * const fetchedPages = await fetchAllTargetPages({ baseUrl, targetPaths, logger });
 * ```
 */
const fetchAllTargetPages = async ({
  baseUrl,
  targetPaths,
  logger,
}: FetchAllTargetPagesParams): Promise<readonly FetchedPage[]> => {
  logger.info({
    message: `Fetching ${targetPaths.length} rendered page(s) for indexing (up to ${MAX_CONCURRENT_FETCHES} at a time)...`,
  });

  const results = await mapWithConcurrencyLimit({
    items: targetPaths,
    limit: MAX_CONCURRENT_FETCHES,
    mapItem: (targetPath) => fetchTargetPage({ baseUrl, targetPath }),
  });

  const fetchedPages: FetchedPage[] = [];
  const failureMessages: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      fetchedPages.push(result.value);
    } else {
      failureMessages.push(
        result.reason instanceof Error ? result.reason.message : String(result.reason),
      );
    }
  }

  if (failureMessages.length > 0) {
    throw new Error(
      `Failed to fetch ${failureMessages.length} of ${targetPaths.length} page(s) for indexing:\n${failureMessages.join("\n")}`,
    );
  }

  return fetchedPages;
};

/**
 * Describes input for building and writing the Pagefind index.
 */
interface BuildAndWritePagefindIndexParams {
  /** Every fetched page to index. */
  readonly fetchedPages: readonly FetchedPage[];
  /** Logger used for progress output. */
  readonly logger: ScriptLogger;
}

/**
 * Feeds every fetched page into a new Pagefind index and writes the bundle
 * to disk.
 *
 * Multilingual handling needs no special-casing here: `app/[locale]/
 * layout.tsx` already renders `<html lang={locale}>`, and Pagefind
 * automatically partitions the single combined index by that attribute.
 *
 * @param params Indexing input.
 * @param params.fetchedPages Every fetched page to index.
 * @param params.logger Logger used for progress output.
 * @throws {Error} Thrown with full detail on any indexing or write failure —
 * nothing is silently skipped.
 * @example
 * ```ts
 * await buildAndWritePagefindIndex({ fetchedPages, logger });
 * ```
 */
const buildAndWritePagefindIndex = async ({
  fetchedPages,
  logger,
}: BuildAndWritePagefindIndexParams): Promise<void> => {
  const { errors: createIndexErrors, index } = await pagefind.createIndex();

  if (createIndexErrors.length > 0 || !index) {
    throw new Error(`Failed to create the Pagefind index:\n${createIndexErrors.join("\n")}`);
  }

  try {
    logger.info({ message: `Indexing ${fetchedPages.length} page(s)...` });

    // Sequential by design: every call mutates the same native-side index
    // through a single background Pagefind service process, so
    // parallelizing gains nothing here and only complicates error
    // attribution.
    for (const page of fetchedPages) {
      const { errors } = await index.addHTMLFile({ url: page.prefixedPath, content: page.html });

      if (errors.length > 0) {
        throw new Error(`Failed to index ${page.prefixedPath}:\n${errors.join("\n")}`);
      }
    }

    const { errors: writeErrors } = await index.writeFiles({ outputPath: PAGEFIND_OUTPUT_PATH });

    if (writeErrors.length > 0) {
      throw new Error(`Failed to write the Pagefind index:\n${writeErrors.join("\n")}`);
    }

    logger.info({ message: `Wrote Pagefind index to ${PAGEFIND_OUTPUT_PATH}` });
  } finally {
    await index.deleteIndex();
  }
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
    const targetPaths = buildTargetPaths();
    const server = await startStandaloneServer({ logger });

    try {
      const fetchedPages = await fetchAllTargetPages({
        baseUrl: server.baseUrl,
        targetPaths,
        logger,
      });
      await buildAndWritePagefindIndex({ fetchedPages, logger });
    } finally {
      await server.stop();
    }
  } catch (error) {
    logger.error({ message: "Failed to build the Pagefind search index.", error });
    process.exitCode = 1;
  } finally {
    await pagefind.close();
  }
};

await main();
