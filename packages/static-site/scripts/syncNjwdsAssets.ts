import { cp, mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Writes an informational script log entry.
 */
export type LogInfo = (params: LogInfoParams) => void;

/**
 * Writes an error script log entry.
 */
export type LogError = (params: LogErrorParams) => void;

/**
 * Describes a required NJWDS asset that must exist before syncing.
 */
export interface RequiredNjwdsAsset {
  /** Relative path inside the NJWDS `dist` directory. */
  readonly relativePath: string;
  /** Human-readable asset purpose used in failure messages. */
  readonly description: string;
}

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
 * Describes input for path existence validation.
 */
interface ValidatePathExistsParams {
  /** Filesystem path that must exist. */
  readonly filePath: string;
  /** Human-readable path purpose used in failure messages. */
  readonly description: string;
}

/**
 * Describes input for validating one required NJWDS asset.
 */
interface ValidateRequiredNjwdsAssetParams {
  /** Source NJWDS `dist` directory. */
  readonly sourceDirectory: string;
  /** Required asset metadata. */
  readonly asset: RequiredNjwdsAsset;
}

/**
 * Describes input for validating all required NJWDS assets.
 */
interface ValidateRequiredNjwdsAssetsParams {
  /** Source NJWDS `dist` directory. */
  readonly sourceDirectory: string;
  /** Assets that must exist before syncing. */
  readonly requiredAssets: readonly RequiredNjwdsAsset[];
}

/**
 * Describes input for syncing NJWDS assets.
 */
interface SyncNjwdsAssetsParams {
  /** Logger used for script progress and failure output. */
  readonly logger: ScriptLogger;
}

/**
 * Describes input for replacing the public NJWDS asset directory.
 */
interface ReplacePublicNjwdsAssetsParams {
  /** Source NJWDS `dist` directory. */
  readonly sourceDirectory: string;
  /** Final public NJWDS `dist` directory. */
  readonly targetDirectory: string;
}

/**
 * Describes input for moving a temporary asset directory into place.
 */
interface MoveTemporaryDirectoryIntoPlaceParams {
  /** Temporary directory containing a complete NJWDS `dist` copy. */
  readonly temporaryDirectory: string;
  /** Final public NJWDS `dist` directory. */
  readonly targetDirectory: string;
}

/**
 * Describes input for detecting retryable filesystem replacement errors.
 */
interface IsRetryableReplacementErrorParams {
  /** Error value raised by `rename`. */
  readonly error: unknown;
}

/**
 * Maximum attempts used when another process recreates the target directory.
 */
const MAX_DIRECTORY_REPLACEMENT_ATTEMPTS = 5;

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
 * Installed NJWDS distribution directory expected from the package dependency.
 */
const NJWDS_SOURCE_DIST_DIRECTORY = path.join(
  PROJECT_ROOT_DIRECTORY,
  "node_modules",
  "@newjersey",
  "njwds",
  "dist",
);

/**
 * Public NJWDS distribution directory served by Next.js.
 */
const NJWDS_PUBLIC_DIST_DIRECTORY = path.join(
  PROJECT_ROOT_DIRECTORY,
  "public",
  "assets",
  "njwds",
  "dist",
);

/**
 * Parent directory for generated public NJWDS assets.
 */
const NJWDS_PUBLIC_PARENT_DIRECTORY = path.dirname(NJWDS_PUBLIC_DIST_DIRECTORY);

/**
 * Required compiled NJWDS files used directly by the Next.js application shell.
 */
const REQUIRED_NJWDS_ASSETS: readonly RequiredNjwdsAsset[] = [
  {
    relativePath: "css/styles.css",
    description: "NJWDS compiled stylesheet",
  },
  {
    relativePath: "js/uswds.min.js",
    description: "NJWDS runtime script",
  },
];

/**
 * Writes an informational message to stdout.
 *
 * @param params Log input.
 * @param params.message Message to write.
 * @example
 * ```ts
 * writeInfo({ message: "Synced assets" });
 * ```
 */
const writeInfo: LogInfo = ({ message }) => {
  process.stdout.write(`${message}\n`);
};

/**
 * Formats an unknown error value for script output.
 *
 * @param params Format input.
 * @param params.error Error value to format.
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
 * @param params.message Message to write.
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
 * Validates one required NJWDS asset file.
 *
 * @param params Validation input.
 * @param params.sourceDirectory Source NJWDS `dist` directory.
 * @param params.asset Required asset metadata.
 * @returns A promise that resolves when the asset exists.
 * @example
 * ```ts
 * await validateRequiredNjwdsAsset({ sourceDirectory, asset });
 * ```
 */
const validateRequiredNjwdsAsset = async ({
  sourceDirectory,
  asset,
}: ValidateRequiredNjwdsAssetParams): Promise<void> => {
  await validatePathExists({
    filePath: path.join(sourceDirectory, asset.relativePath),
    description: asset.description,
  });
};

/**
 * Validates every required NJWDS asset concurrently.
 *
 * @param params Validation input.
 * @param params.sourceDirectory Source NJWDS `dist` directory.
 * @param params.requiredAssets Assets that must exist.
 * @returns A promise that resolves when every required asset exists.
 * @example
 * ```ts
 * await validateRequiredNjwdsAssets({ sourceDirectory, requiredAssets });
 * ```
 */
const validateRequiredNjwdsAssets = async ({
  sourceDirectory,
  requiredAssets,
}: ValidateRequiredNjwdsAssetsParams): Promise<void> => {
  const validationPromises = requiredAssets.map((asset) => {
    return validateRequiredNjwdsAsset({ sourceDirectory, asset });
  });

  await Promise.all(validationPromises);
};

/**
 * Builds a unique temporary directory for one sync operation.
 *
 * @returns Absolute temporary directory path.
 * @example
 * ```ts
 * const temporaryDirectory = buildTemporaryNjwdsDistDirectory();
 * ```
 */
const buildTemporaryNjwdsDistDirectory = (): string => {
  return path.join(NJWDS_PUBLIC_PARENT_DIRECTORY, `.dist-${process.pid}-${Date.now()}`);
};

/**
 * Checks whether a directory replacement error can be retried.
 *
 * @param params Retry check input.
 * @param params.error Error value raised by `rename`.
 * @returns `true` when removing the target and retrying can resolve the error.
 * @example
 * ```ts
 * const canRetry = isRetryableReplacementError({ error });
 * ```
 */
const isRetryableReplacementError = ({ error }: IsRetryableReplacementErrorParams): boolean => {
  return (
    error instanceof Error &&
    "code" in error &&
    (error.code === "EEXIST" || error.code === "ENOTEMPTY")
  );
};

/**
 * Moves a temporary NJWDS directory into the public target path.
 *
 * @param params Move input.
 * @param params.temporaryDirectory Complete temporary NJWDS `dist` copy.
 * @param params.targetDirectory Final public NJWDS `dist` directory.
 * @returns A promise that resolves when the temporary directory is moved.
 * @throws {Error} Thrown when the target cannot be replaced after bounded retries.
 * @example
 * ```ts
 * await moveTemporaryDirectoryIntoPlace({ temporaryDirectory, targetDirectory });
 * ```
 */
const moveTemporaryDirectoryIntoPlace = async ({
  temporaryDirectory,
  targetDirectory,
}: MoveTemporaryDirectoryIntoPlaceParams): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_DIRECTORY_REPLACEMENT_ATTEMPTS; attempt += 1) {
    await rm(targetDirectory, { recursive: true, force: true });

    try {
      await rename(temporaryDirectory, targetDirectory);

      return;
    } catch (error) {
      if (
        attempt === MAX_DIRECTORY_REPLACEMENT_ATTEMPTS ||
        !isRetryableReplacementError({ error })
      ) {
        throw error;
      }
    }
  }
};

/**
 * Replaces the public NJWDS directory using a per-process temporary copy.
 *
 * @param params Replacement input.
 * @param params.sourceDirectory Source NJWDS `dist` directory.
 * @param params.targetDirectory Final public NJWDS `dist` directory.
 * @returns A promise that resolves when replacement is complete.
 * @example
 * ```ts
 * await replacePublicNjwdsAssets({ sourceDirectory, targetDirectory });
 * ```
 */
const replacePublicNjwdsAssets = async ({
  sourceDirectory,
  targetDirectory,
}: ReplacePublicNjwdsAssetsParams): Promise<void> => {
  const temporaryDirectory = buildTemporaryNjwdsDistDirectory();

  try {
    await mkdir(NJWDS_PUBLIC_PARENT_DIRECTORY, { recursive: true });
    await cp(sourceDirectory, temporaryDirectory, { recursive: true });
    await moveTemporaryDirectoryIntoPlace({ temporaryDirectory, targetDirectory });
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true });

    throw error;
  }
};

/**
 * Syncs compiled NJWDS assets into the public assets tree.
 *
 * @param params Sync input.
 * @param params.logger Logger used for progress output.
 * @returns A promise that resolves when the sync has completed.
 * @throws {Error} Thrown when the installed NJWDS package does not include required assets.
 * @example
 * ```ts
 * await syncNjwdsAssets({ logger });
 * ```
 */
const syncNjwdsAssets = async ({ logger }: SyncNjwdsAssetsParams): Promise<void> => {
  await validatePathExists({
    filePath: NJWDS_SOURCE_DIST_DIRECTORY,
    description: "NJWDS dist directory",
  });
  await validateRequiredNjwdsAssets({
    sourceDirectory: NJWDS_SOURCE_DIST_DIRECTORY,
    requiredAssets: REQUIRED_NJWDS_ASSETS,
  });
  await replacePublicNjwdsAssets({
    sourceDirectory: NJWDS_SOURCE_DIST_DIRECTORY,
    targetDirectory: NJWDS_PUBLIC_DIST_DIRECTORY,
  });

  logger.info({ message: `Synced NJWDS assets to ${NJWDS_PUBLIC_DIST_DIRECTORY}` });
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
    await syncNjwdsAssets({ logger });
  } catch (error) {
    logger.error({ message: "Failed to sync NJWDS assets.", error });
    process.exitCode = 1;
  }
};

await main();
