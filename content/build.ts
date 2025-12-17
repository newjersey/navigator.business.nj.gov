/**
 * Build Script for Navigator Content
 *
 * This script generates static JSON files from content sources (markdown, JSON) for use
 * in the business.nj.gov My Account application. It processes 8 content types:
 * industries, tasks, actions, certifications, filings, fundings, license events, and reinstatements.
 *
 * ## Architecture
 *
 * 1. **Infrastructure Layer** - File system operations (readFile, writeFile, etc.)
 *    - Abstracted behind FileSystemPort interface for dependency injection
 *    - Makes the code 100% testable without touching the real file system
 *
 * 2. **Domain Layer** - Pure business logic (parseIndustryFile, buildIndustries, etc.)
 *    - No dependencies on file system or external libraries
 *    - Receives file system port as parameter for all I/O operations
 *
 * 3. **Application Layer** - Orchestration (buildAndWriteContent, executeBuild, main)
 *    - Coordinates domain functions with infrastructure
 *    - Uses metaprogramming pattern (contentConfigs array) to eliminate code duplication
 *
 * ## Metaprogramming Pattern
 *
 * Instead of writing 7 nearly-identical build functions for each of the Markdown imports, we use a configuration-driven approach:
 * - contentConfigs array defines metadata for each content type
 * - buildAndWriteContent() generic helper handles all content types
 * - executeBuild() loops through configs instead of calling individual functions
 */

import fs from "node:fs";
import path from "node:path";

import { loadAllAnytimeActionLicenseReinstatements } from "@businessnjgovnavigator/shared/static/loadAnytimeActionLicenseReinstatements";
import { loadAllAnytimeActionTasks } from "@businessnjgovnavigator/shared/static/loadAnytimeActionTasks";
import { loadAllCertifications } from "@businessnjgovnavigator/shared/static/loadCertifications";
import { loadAllFilings } from "@businessnjgovnavigator/shared/static/loadFilings";
import { loadAllFundings } from "@businessnjgovnavigator/shared/static/loadFundings";
import { loadAllLicenseCalendarEvents } from "@businessnjgovnavigator/shared/static/loadLicenseCalendarEvents";
import { loadAllTasks } from "@businessnjgovnavigator/shared/static/loadTasks";

// ============================================================================
// DOMAIN TYPES
// ============================================================================

/**
 * Build result statistics for all content types.
 */
export interface BuildResult {
  /** Number of industries built */
  industriesCount: number;
  /** Number of tasks built */
  tasksCount: number;
  /** Number of anytime action tasks built */
  actionsCount: number;
  /** Number of certifications built */
  certificationsCount: number;
  /** Number of filings built */
  filingsCount: number;
  /** Number of fundings built */
  fundingsCount: number;
  /** Number of license calendar events built */
  licenseCalendarEventsCount: number;
  /** Number of license reinstatements built */
  licenseReinstatementsCount: number;
}

/**
 * Build configuration with directory paths.
 */
export interface BuildConfig {
  /** Root directory for content */
  rootDir: string;
  /** Output directory for built files */
  outputDir: string;
}

/**
 * Port interface for file system operations.
 * Uses dependency injection pattern for testability.
 */
export interface FileSystemPort {
  /** Reads all filenames in a directory */
  readDirectory: (directoryPath: string) => string[];
  /** Reads file contents as UTF-8 string */
  readFile: (filePath: string) => string;
  /** Writes data to file as minified JSON */
  writeJsonFile: (filePath: string, data: unknown) => void;
  /** Writes data to file as pretty-printed JSON with 2-space indentation */
  writePrettyJsonFile: (filePath: string, data: unknown) => void;
}

// ============================================================================
// INFRASTRUCTURE LAYER - File System Port
// ============================================================================

/**
 * Ensures a directory exists, creating it recursively if needed.
 *
 * @param filePath - Path to file (directory will be extracted)
 */
const ensureDirectoryExists = (filePath: string): void => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
};

/**
 * Reads all filenames in a directory.
 *
 * @param directoryPath - Path to directory
 * @returns Array of filenames
 */
const readDirectory = (directoryPath: string): string[] => fs.readdirSync(directoryPath);

/**
 * Reads file contents as UTF-8 string.
 *
 * @param filePath - Path to file
 * @returns File contents
 */
const readFile = (filePath: string): string => fs.readFileSync(filePath, "utf8");

/**
 * Writes data to file as minified JSON.
 * Ensures parent directory exists before writing.
 *
 * @param filePath - Path to output file
 * @param data - Data to write
 */
const writeJsonFile = (filePath: string, data: unknown): void => {
  ensureDirectoryExists(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data));
};

/**
 * Writes data to file as pretty-printed JSON with 2-space indentation.
 * Ensures parent directory exists before writing.
 * Used for human-readable debugging output.
 *
 * @param filePath - Path to output file
 * @param data - Data to write
 */
const writePrettyJsonFile = (filePath: string, data: unknown): void => {
  ensureDirectoryExists(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
};

/**
 * Creates a file system port with all file operations.
 * Factory function for dependency injection.
 *
 * @returns File system operations port
 */
export const createFileSystemPort = (): FileSystemPort => ({
  readDirectory,
  readFile,
  writeJsonFile,
  writePrettyJsonFile,
});

// ============================================================================
// DOMAIN LAYER - Industry Builder
// ============================================================================

/**
 * Filters for JSON files only.
 * Pure predicate function for array filtering.
 *
 * @param filename - Filename to check
 * @returns True if file ends with .json
 */
export const isJsonFile = (filename: string): boolean => filename.endsWith(".json");

/**
 * Parses a single industry JSON file.
 *
 * @param fileSystem - File system operations
 * @param sourceDir - Directory containing the file
 * @param filename - Industry filename
 * @returns Parsed industry object
 */
export const parseIndustryFile = (
  fileSystem: FileSystemPort,
  sourceDir: string,
  filename: string,
): unknown => {
  const filePath = path.join(sourceDir, filename);
  const content = fileSystem.readFile(filePath);
  return JSON.parse(content);
};

/**
 * Builds industry collection from source directory.
 * Filters out non-JSON files and parses each industry file.
 *
 * @param fileSystem - File system operations
 * @param sourceDir - Directory containing industry JSON files
 * @returns Array of industry objects
 */
export const buildIndustries = (fileSystem: FileSystemPort, sourceDir: string): unknown[] => {
  const filenames = fileSystem.readDirectory(sourceDir);
  return filenames
    .filter(isJsonFile)
    .map((filename) => parseIndustryFile(fileSystem, sourceDir, filename));
};

// ============================================================================
// APPLICATION LAYER - Build Operations
// ============================================================================

/**
 * Generic helper to build and write content to JSON files.
 *
 * This is the core abstraction that eliminates code duplication across all content types.
 * Instead of having 7+ nearly-identical functions, we use this single generic helper
 * with different loader functions passed via the contentConfigs array.
 *
 * Generates both minified and pretty-printed JSON outputs:
 * - {outputFileName}.json - Minified for production use
 * - {outputFileName}.pretty.json - Pretty-printed for development/debugging
 *
 * @example
 * buildAndWriteContent(
 *   fileSystem,
 *   config,
 *   () => loadAllTasks(false),
 *   "tasks",
 *   "tasks"
 * )
 * // Outputs: lib/tasks.json and lib/tasks.pretty.json containing { "tasks": [...] }
 *
 * @param fileSystem - File system operations (dependency injection for testability)
 * @param config - Build configuration with rootDir and outputDir
 * @param loader - Function that loads the content from source (e.g., loadAllTasks)
 * @param outputFileName - Base name for output files (without .json extension)
 * @param dataKey - Key name for wrapping the content in output JSON (e.g., "tasks" → { "tasks": [...] })
 * @returns Loaded content array for statistics/testing
 */
export const buildAndWriteContent = <T>(
  fileSystem: FileSystemPort,
  config: BuildConfig,
  loader: () => T[],
  outputFileName: string,
  dataKey: string,
): T[] => {
  const content = loader();
  const wrappedData = { [dataKey]: content };
  const outputPath = path.join(config.outputDir, `${outputFileName}.json`);
  const prettyOutputPath = path.join(config.outputDir, `${outputFileName}.pretty.json`);

  fileSystem.writeJsonFile(outputPath, wrappedData);
  fileSystem.writePrettyJsonFile(prettyOutputPath, wrappedData);

  return content;
};

/**
 * Builds and writes industry data to file.
 * Generates both minified and pretty-printed JSON outputs.
 *
 * @param fileSystem - File system operations
 * @param config - Build configuration
 * @returns Built industries for statistics
 */
export const buildAndWriteIndustries = (
  fileSystem: FileSystemPort,
  config: BuildConfig,
): unknown[] => {
  const sourceDir = path.join(config.rootDir, "src/roadmaps/industries");
  return buildAndWriteContent(
    fileSystem,
    config,
    () => buildIndustries(fileSystem, sourceDir),
    "industry",
    "industries",
  );
};

/**
 * Configuration for a content type build operation.
 *
 * This interface defines the metadata needed to build any content type.
 * By using a configuration object, we avoid writing repetitive build functions
 * for each content type (tasks, actions, certifications, etc.).
 *
 * @example
 * {
 *   loader: () => loadAllTasks(false),
 *   outputFileName: "tasks",
 *   dataKey: "tasks",
 *   resultKey: "tasksCount"
 * }
 * // This config will:
 * // 1. Call loadAllTasks(false) to get the content
 * // 2. Write to lib/tasks.json and lib/tasks.pretty.json
 * // 3. Wrap content as { "tasks": [...] }
 * // 4. Store count in result.tasksCount
 */
export interface ContentConfig {
  /** Function that loads the content from source (from @businessnjgovnavigator/shared) */
  loader: () => unknown[];
  /** Base filename for output (without .json extension). Example: "tasks" produces tasks.json */
  outputFileName: string;
  /** JSON key for wrapping the content in output files. Example: "tasks" produces { "tasks": [...] } */
  dataKey: string;
  /** Key for storing count in BuildResult. Must match a property in BuildResult interface */
  resultKey: keyof BuildResult;
}

/**
 * Configuration array defining all content types to build.
 *
 * This is the metaprogramming approach that replaces 7 individual build functions.
 * Each entry defines how to build a specific content type (tasks, actions, etc.).
 *
 * To add a new content type:
 * 1. Add a loader function to @businessnjgovnavigator/shared
 * 2. Add a count property to BuildResult interface
 * 3. Add a new entry to this array
 * 4. No other code changes needed!
 *
 * Note: Industries are handled separately (buildAndWriteIndustries) because they
 * use a custom file-based loader instead of the shared package loaders.
 */
export const contentConfigs: ContentConfig[] = [
  {
    loader: () => loadAllTasks(false),
    outputFileName: "tasks",
    dataKey: "tasks",
    resultKey: "tasksCount",
  },
  {
    loader: () => loadAllAnytimeActionTasks(false),
    outputFileName: "actions",
    dataKey: "actions",
    resultKey: "actionsCount",
  },
  {
    loader: () => loadAllCertifications(),
    outputFileName: "certifications",
    dataKey: "certifications",
    resultKey: "certificationsCount",
  },
  {
    loader: () => loadAllFilings(),
    outputFileName: "filings",
    dataKey: "filings",
    resultKey: "filingsCount",
  },
  {
    loader: () => loadAllFundings(),
    outputFileName: "fundings",
    dataKey: "fundings",
    resultKey: "fundingsCount",
  },
  {
    loader: () => loadAllLicenseCalendarEvents(),
    outputFileName: "license-calendar-events",
    dataKey: "licenseCalendarEvents",
    resultKey: "licenseCalendarEventsCount",
  },
  {
    loader: () => loadAllAnytimeActionLicenseReinstatements(),
    outputFileName: "license-reinstatements",
    dataKey: "licenseReinstatements",
    resultKey: "licenseReinstatementsCount",
  },
];

/**
 * Executes the complete build process for all 8 content types.
 *
 * This function demonstrates the metaprogramming pattern:
 * - Instead of calling buildAndWriteTasks(), buildAndWriteActions(), etc.
 * - We loop through contentConfigs and call buildAndWriteContent() with each config
 * - This eliminates ~150 lines of repetitive code while remaining fully type-safe
 *
 * Build order:
 * 1. Industries (special case - reads from JSON files in src/roadmaps/industries/)
 * 2. All other content types (loop through contentConfigs array)
 *    - Tasks, actions, certifications, filings, fundings, license events, reinstatements
 *    - Each uses a loader function from @businessnjgovnavigator/shared
 *    - Loaders handle markdown parsing with content-type-specific converters
 *
 * @param fileSystem - File system operations (injected for testability)
 * @param config - Build configuration with rootDir and outputDir
 * @returns Build statistics with counts for all 8 content types
 */
export const executeBuild = (fileSystem: FileSystemPort, config: BuildConfig): BuildResult => {
  // Build industries first (special case with custom loader)
  const industries = buildAndWriteIndustries(fileSystem, config);

  // Build all other content types using configuration-driven approach
  const result: Partial<BuildResult> = {
    industriesCount: industries.length,
  };

  // Loop through each content type config and build it
  for (const contentConfig of contentConfigs) {
    const content = buildAndWriteContent(
      fileSystem,
      config,
      contentConfig.loader,
      contentConfig.outputFileName,
      contentConfig.dataKey,
    );
    result[contentConfig.resultKey] = content.length;
  }

  return result as BuildResult;
};

// ============================================================================
// APPLICATION LAYER - Build Configuration
// ============================================================================

/**
 * Creates build configuration using current directory.
 * Determines root and output directories relative to this file.
 *
 * @returns Build configuration
 */
export const createBuildConfig = (): BuildConfig => {
  return {
    rootDir: __dirname,
    outputDir: path.join(__dirname, "lib"),
  };
};

/**
 * Logs build results to console.
 * Displays statistics for all 8 content types with checkmarks.
 *
 * @param result - Build statistics
 */
export const logBuildResults = (result: BuildResult): void => {
  console.log(`✓ Built industry.json with ${result.industriesCount} industries`);
  console.log(`✓ Built tasks.json with ${result.tasksCount} tasks`);
  console.log(`✓ Built actions.json with ${result.actionsCount} anytime actions`);
  console.log(`✓ Built certifications.json with ${result.certificationsCount} certifications`);
  console.log(`✓ Built filings.json with ${result.filingsCount} filings`);
  console.log(`✓ Built fundings.json with ${result.fundingsCount} fundings`);
  console.log(
    `✓ Built license-calendar-events.json with ${result.licenseCalendarEventsCount} license-related calendar events`,
  );
  console.log(
    `✓ Built license-reinstatements.json with ${result.licenseReinstatementsCount} license reinstatements`,
  );
};

// ============================================================================
// ENTRY POINT - Composition Root
// ============================================================================

/**
 * Main build execution.
 * Composes all dependencies and executes build process.
 *
 * This script generates static JSON files for all content types:
 * - Industries: Business industry configurations with roadmap settings
 * - Tasks: All task types from multiple directories (tasks, license-tasks, etc.)
 * - Actions: Anytime Action tasks
 * - Certifications: Business certifications
 * - Filings: Tax filings
 * - Fundings: Funding opportunities
 * - License Calendar Events: License-related calendar events
 * - License Reinstatements: License reinstatement actions
 *
 * Each content type generates two files:
 * - {type}.json - Minified for production use
 * - {type}.pretty.json - Pretty-printed for development/debugging
 *
 * Content parsing is delegated to shared loader functions which:
 * - Apply proper markdown converters specific to each content type
 * - Handle multiple source directories where applicable
 * - Parse frontmatter and markdown content
 * - Link related content (e.g., task dependencies)
 */
export const main = (): void => {
  // Create ports (dependency injection)
  const fileSystem = createFileSystemPort();

  // Create configuration
  const config = createBuildConfig();

  // Execute build (content parsing handled by shared loaders)
  const result = executeBuild(fileSystem, config);

  // Log results
  logBuildResults(result);
};

// Execute build only when run directly (not when imported)
/* istanbul ignore next */
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
