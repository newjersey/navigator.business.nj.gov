/**
 * Provides a small process-backed logger shared by `packages/static-site` build
 * scripts.
 *
 * Scripts run via `tsx` outside of Next.js/Vitest, so they need their own
 * lightweight logging rather than relying on a framework logger.
 */

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
 * @returns Logger implementation shared by static-site build scripts.
 * @example
 * ```ts
 * const logger = createProcessLogger();
 * ```
 */
export const createProcessLogger = (): ScriptLogger => {
  return {
    info: writeInfo,
    error: writeError,
  };
};
