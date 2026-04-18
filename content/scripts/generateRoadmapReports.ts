/**
 * Content Logic Map Report Generator
 *
 * Generates 6 CSV reports from content source files that document how industries,
 * tasks, business structures, and conditional questions relate to each other.
 * These reports replicate the "NJ My Account Content Logic Map" Google Sheet.
 *
 * ## Usage
 *   cd content && tsx -r tsconfig-paths/register ./scripts/generateRoadmapReports.ts
 *
 * ## Reports Generated
 * 1. report_industry_overview.csv - Industry onboarding/location questions
 * 2. report_industry_tasks.csv - Unique (non-common) tasks per industry
 * 3. report_business_structure_tasks.csv - Tasks added by each legal structure
 * 4. report_home_based_tasks.csv - Home-based vs permanent-location tasks
 * 5. report_logic_map_llc.csv - Full roadmap per industry x legal structure
 * 6. report_logic_map_v2.csv - Simplified unique-task view per industry
 */

import fs from "node:fs";
import path from "node:path";

import { LegalStructures } from "@businessnjgovnavigator/shared/legalStructure";
import { Industry, AddOn } from "@businessnjgovnavigator/shared/industry";
import { loadAllTasks } from "@businessnjgovnavigator/shared/static/loadTasks";
import { loadAllAddOns } from "@businessnjgovnavigator/shared/static/loadAllAddOns";
import { Task, IndustryRoadmap } from "@businessnjgovnavigator/shared/types/types";
import { getEssentialQuestion } from "../../web/src/lib/domain-logic/essentialQuestions";
import { main as buildContent } from "../build";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Root directory of the content package */
const CONTENT_ROOT = path.resolve(__dirname, "..");

/** Directory containing industry JSON files */
const INDUSTRIES_DIR = path.join(CONTENT_ROOT, "src/roadmaps/industries");

/** Path to profile field configuration */
const PROFILE_JSON_PATH = path.join(CONTENT_ROOT, "src/fieldConfig/profile.json");

/** Path to non-essential questions JSON */
const NON_ESSENTIAL_QUESTIONS_PATH = path.join(
  CONTENT_ROOT,
  "src/roadmaps/nonEssentialQuestions.json",
);

/** Output directory for generated reports */
const REPORTS_DIR = path.join(__dirname, "reports");

/** The "generic" industry ID used as the baseline for common tasks */
const GENERIC_INDUSTRY_ID = "generic";

/** Add-on ID for permanent-location business tasks */
const PERMANENT_LOCATION_ADDON_ID = "permanent-location-business";

/** Add-on ID for home-based transportation tasks */
const HOME_BASED_TRANSPORTATION_ADDON_ID = "home-based-transportation";

// ============================================================================
// DOMAIN TYPES
// ============================================================================

/** Profile field configuration from profile.json */
interface ProfileFieldConfig {
  profileDefaults: {
    fields: Record<
      string,
      {
        default: {
          description?: string;
          altDescription?: string;
          header?: string;
          [key: string]: unknown;
        };
      }
    >;
  };
}

/** Non-essential question from nonEssentialQuestions.json */
interface NonEssentialQuestion {
  id: string;
  questionText: string;
  addOnWhenNo?: string;
  addOnWhenYes?: string;
}

/**
 * Extends the shared AddOn type with the `required` field present in industry JSON files
 * but not declared in the shared type definition.
 */
interface RoadmapStep extends AddOn {
  readonly required?: boolean;
}

/** A roadmap step with its source annotation */
interface AnnotatedStep {
  step: number;
  weight: number;
  taskFilename: string;
  taskName: string;
  required: boolean;
  isLicenseTask: boolean;
  isUnique: boolean;
  source: string;
}

// ============================================================================
// FILE SYSTEM PORT
// ============================================================================

/**
 * Port interface for file system operations.
 * Uses dependency injection pattern for testability.
 */
interface FileSystemPort {
  /** Reads file contents as UTF-8 string */
  readFile: (filePath: string) => string;
  /** Reads all filenames in a directory */
  readDirectory: (directoryPath: string) => string[];
  /** Writes string content to a file */
  writeFile: (filePath: string, content: string) => void;
  /** Ensures a directory exists, creating it recursively if needed */
  ensureDirectory: (dirPath: string) => void;
}

/**
 * Creates a file system port backed by Node's fs module.
 *
 * @returns FileSystemPort with real file system operations
 */
const createFileSystemPort = (): FileSystemPort => ({
  readFile: (filePath: string): string => fs.readFileSync(filePath, "utf8"),
  readDirectory: (directoryPath: string): string[] => fs.readdirSync(directoryPath),
  writeFile: (filePath: string, content: string): void => fs.writeFileSync(filePath, content),
  ensureDirectory: (dirPath: string): void => {
    fs.mkdirSync(dirPath, { recursive: true });
  },
});

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Loads all industry JSON files from the industries directory.
 *
 * @param fileSystem - File system operations
 * @returns Array of Industry objects parsed from JSON files
 */
const loadIndustries = (fileSystem: FileSystemPort): Industry[] => {
  const filenames = fileSystem.readDirectory(INDUSTRIES_DIR);
  return filenames
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fileSystem.readFile(path.join(INDUSTRIES_DIR, f))) as Industry);
};

/**
 * Loads the profile field configuration from profile.json.
 *
 * @param fileSystem - File system operations
 * @returns Parsed profile field configuration
 */
const loadProfileFieldConfig = (fileSystem: FileSystemPort): ProfileFieldConfig => {
  return JSON.parse(fileSystem.readFile(PROFILE_JSON_PATH)) as ProfileFieldConfig;
};

/**
 * Loads non-essential questions from nonEssentialQuestions.json.
 *
 * @param fileSystem - File system operations
 * @returns Array of non-essential question objects
 */
const loadNonEssentialQuestions = (fileSystem: FileSystemPort): NonEssentialQuestion[] => {
  const data = JSON.parse(fileSystem.readFile(NON_ESSENTIAL_QUESTIONS_PATH)) as {
    nonEssentialQuestionsArray: NonEssentialQuestion[];
  };
  return data.nonEssentialQuestionsArray;
};

/**
 * Builds an index mapping task filename (without .md) to display name.
 * Includes tasks from all directories (tasks, license-tasks, etc.).
 *
 * @param tasks - Array of Task objects from loadAllTasks()
 * @returns Map from task filename to display name
 */
const buildTaskNameIndex = (tasks: Task[]): Map<string, string> => {
  const index = new Map<string, string>();
  for (const task of tasks) {
    index.set(task.filename, task.name);
  }
  return index;
};

/**
 * Builds an index mapping add-on ID to its IndustryRoadmap data.
 *
 * @param addOns - Array of IndustryRoadmap objects from loadAllAddOns()
 * @returns Map from add-on ID to IndustryRoadmap
 */
const buildAddOnIndex = (addOns: IndustryRoadmap[]): Map<string, IndustryRoadmap> => {
  const index = new Map<string, IndustryRoadmap>();
  for (const addOn of addOns) {
    index.set(addOn.id, addOn);
  }
  return index;
};

// ============================================================================
// SHARED LOGIC - Question Text
// ============================================================================

/**
 * Strips markdown link syntax from a description string.
 * Converts backtick-delimited link syntax like `home-based business|home-based-business`
 * into plain text ("home-based business").
 *
 * @param text - Text potentially containing markdown link syntax
 * @returns Text with link syntax replaced by the display portion
 */
const stripMarkdownLinks = (text: string): string => {
  return text.replace(/`([^|`]+)\|[^`]+`/g, "$1");
};

/**
 * Looks up the display text for a profile field from profile.json.
 * Prefers altDescription when present (used for onboarding phrasing).
 *
 * @param fieldName - Profile field name (e.g., "homeBasedBusiness", "liquorLicense")
 * @param profileConfig - Loaded profile field configuration
 * @returns Display text for the field, with markdown links stripped
 */
const getQuestionText = (fieldName: string, profileConfig: ProfileFieldConfig): string => {
  const fieldConfig = profileConfig.profileDefaults.fields[fieldName];
  if (!fieldConfig) {
    return `[Unknown field: ${fieldName}]`;
  }
  const raw = fieldConfig.default.altDescription ?? fieldConfig.default.description ?? "";
  return stripMarkdownLinks(raw);
};

/**
 * Gets essential questions applicable to an industry, including the canBeHomeBased
 * special case which is not part of the EssentialQuestions array.
 *
 * @param industry - Industry object
 * @param profileConfig - Loaded profile field configuration
 * @returns Array of { fieldName, questionText } pairs for all applicable onboarding questions
 */
const getOnboardingQuestionsForIndustry = (
  industry: Industry,
  profileConfig: ProfileFieldConfig,
): Array<{ fieldName: string; questionText: string }> => {
  const questions: Array<{ fieldName: string; questionText: string }> = [];

  // Essential questions from the EssentialQuestions array
  const essentialQs = getEssentialQuestion(industry.id);
  for (const eq of essentialQs) {
    questions.push({
      fieldName: eq.fieldName,
      questionText: getQuestionText(eq.fieldName, profileConfig),
    });
  }

  return questions;
};

// ============================================================================
// SHARED LOGIC - Generic Baseline Tasks
// ============================================================================

/**
 * Computes the set of task filenames that constitute the "common" baseline.
 * This is the union of:
 * 1. All tasks from the "generic" industry roadmapSteps
 * 2. All tasks from the permanent-location-business add-on
 *
 * Any task NOT in this set is considered "unique" to its industry.
 *
 * @param industries - All loaded industries
 * @param addOnIndex - Map of add-on ID to IndustryRoadmap
 * @returns Set of task filenames (task or licenseTask) considered common
 */
const getGenericBaselineTasks = (
  industries: Industry[],
  addOnIndex: Map<string, IndustryRoadmap>,
): Set<string> => {
  const generic = industries.find((i) => i.id === GENERIC_INDUSTRY_ID);
  const baseline = new Set<string>();

  if (generic) {
    for (const step of generic.roadmapSteps) {
      const taskName = step.task || step.licenseTask || "";
      if (taskName) {
        baseline.add(taskName);
      }
    }
  }

  const permLocation = addOnIndex.get(PERMANENT_LOCATION_ADDON_ID);
  if (permLocation) {
    for (const step of permLocation.roadmapSteps) {
      const taskName = step.task || step.licenseTask || "";
      if (taskName) {
        baseline.add(taskName);
      }
    }
  }

  return baseline;
};

// ============================================================================
// SHARED LOGIC - Legal Structure Add-Ons
// ============================================================================

/**
 * Determines which add-on IDs apply for a given legal structure.
 * Replicates the logic from web/src/lib/roadmap/buildUserRoadmap.ts getLegalStructureAddOns()
 * for the STARTING (non-foreign) persona.
 *
 * @param legalStructureId - Legal structure ID (e.g., "limited-liability-company")
 * @returns Array of add-on IDs to apply
 */
const getLegalStructureAddOnIds = (legalStructureId: string): string[] => {
  const structure = LegalStructures.find((ls) => ls.id === legalStructureId);
  if (!structure) {
    return [];
  }

  const addOns: string[] = [];

  if (structure.requiresPublicFiling) {
    addOns.push("public-record-filing");
  } else if (structure.hasTradeName) {
    addOns.push("trade-name");
  }

  if (legalStructureId === "s-corporation") {
    addOns.push("scorp");
  }

  if (legalStructureId === "nonprofit") {
    addOns.push("nonprofit");
  }

  return addOns;
};

// ============================================================================
// SHARED LOGIC - Roadmap Building
// ============================================================================

/**
 * Extracts the task filename from an AddOn step, handling both task and licenseTask fields.
 *
 * @param step - AddOn step from an industry or add-on roadmap
 * @returns Task filename, or empty string if neither field is populated
 */
const getTaskFilenameFromStep = (step: AddOn): string => {
  return step.task || step.licenseTask || "";
};

/**
 * Determines if a step references a license task (as opposed to a regular task).
 *
 * @param step - AddOn step from an industry or add-on roadmap
 * @returns True if the step's task comes from the licenseTask field
 */
const isLicenseTaskStep = (step: AddOn): boolean => {
  return !step.task && !!step.licenseTask;
};

/**
 * Builds the complete roadmap for an industry + legal structure combination.
 * Merges:
 * 1. Industry base roadmapSteps
 * 2. Legal structure add-on tasks
 * 3. Permanent-location tasks (if industry canHavePermanentLocation)
 *
 * Applies task modifications from add-ons (e.g., nonprofit replaces business-plan).
 * Sorts by (step, weight).
 * Marks each task as unique or common relative to the generic baseline.
 *
 * @param industry - Industry object
 * @param legalStructureId - Legal structure ID
 * @param addOnIndex - Map of add-on ID to IndustryRoadmap
 * @param taskNameIndex - Map of task filename to display name
 * @param baselineTasks - Set of common task filenames
 * @returns Sorted array of AnnotatedStep objects
 */
const buildFullRoadmap = (
  industry: Industry,
  legalStructureId: string,
  addOnIndex: Map<string, IndustryRoadmap>,
  taskNameIndex: Map<string, string>,
  baselineTasks: Set<string>,
): AnnotatedStep[] => {
  const allSteps: Array<RoadmapStep & { source: string }> = [];

  // 1. Industry base steps
  for (const step of industry.roadmapSteps) {
    allSteps.push({ ...step, source: "industry" });
  }

  // 2. Legal structure add-on steps
  const lsAddOnIds = getLegalStructureAddOnIds(legalStructureId);
  const modifications: Array<{ taskToReplaceFilename: string; replaceWithFilename: string }> = [];

  for (const addOnId of lsAddOnIds) {
    const addOn = addOnIndex.get(addOnId);
    if (addOn) {
      for (const step of addOn.roadmapSteps) {
        allSteps.push({ ...step, source: `addon:${addOnId}` });
      }
      if (addOn.modifications) {
        modifications.push(...addOn.modifications);
      }
    }
  }

  // 3. Permanent-location tasks (if applicable)
  if (industry.canHavePermanentLocation) {
    const permLocation = addOnIndex.get(PERMANENT_LOCATION_ADDON_ID);
    if (permLocation) {
      for (const step of permLocation.roadmapSteps) {
        allSteps.push({ ...step, source: "addon:permanent-location" });
      }
    }
  }

  // Apply modifications (e.g., nonprofit replaces business-plan with nonprofit-business-plan)
  const modMap = new Map(
    modifications.map((m) => [m.taskToReplaceFilename, m.replaceWithFilename]),
  );

  const annotated: AnnotatedStep[] = allSteps
    .map((step) => {
      let filename = getTaskFilenameFromStep(step);
      if (!filename) {
        return null;
      }
      // Apply modifications
      if (modMap.has(filename)) {
        filename = modMap.get(filename)!;
      }
      return {
        step: step.step,
        weight: step.weight,
        taskFilename: filename,
        taskName: taskNameIndex.get(filename) ?? `[${filename}]`,
        required: !!step.required,
        isLicenseTask: isLicenseTaskStep(step),
        isUnique: !baselineTasks.has(filename),
        source: step.source,
      };
    })
    .filter((s): s is AnnotatedStep => s !== null);

  // Sort by step, then weight
  annotated.sort((a, b) => a.step - b.step || a.weight - b.weight);

  return annotated;
};

// ============================================================================
// CSV UTILITIES
// ============================================================================

/**
 * Escapes a value for CSV output.
 * Wraps the value in double quotes if it contains commas, quotes, or newlines.
 *
 * @param value - String value to escape
 * @returns CSV-safe string
 */
const escapeCsvValue = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Converts a 2D array of strings into CSV format.
 *
 * @param headers - Column header names
 * @param rows - Array of row arrays (each row is an array of cell values)
 * @returns CSV string
 */
const toCsv = (headers: string[], rows: string[][]): string => {
  const lines = [headers.map(escapeCsvValue).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(","));
  }
  return lines.join("\n") + "\n";
};

/**
 * Writes a CSV file to the reports directory.
 *
 * @param fileSystem - File system operations
 * @param filename - Output filename (e.g., "report_industry_overview.csv")
 * @param headers - Column header names
 * @param rows - Array of row arrays
 */
const writeCsv = (
  fileSystem: FileSystemPort,
  filename: string,
  headers: string[],
  rows: string[][],
): void => {
  const content = toCsv(headers, rows);
  fileSystem.writeFile(path.join(REPORTS_DIR, filename), content);
};

// ============================================================================
// REPORT 1: Industry Roadmap Overview
// ============================================================================

/**
 * Generates Report 1: Industry Roadmap Overview.
 * Lists each enabled industry with its onboarding question and location question.
 *
 * @param fileSystem - File system operations
 * @param industries - All loaded industries (will be filtered to enabled only)
 * @param profileConfig - Profile field configuration for question text lookup
 * @returns Number of rows generated
 */
const generateIndustryOverview = (
  fileSystem: FileSystemPort,
  industries: Industry[],
  profileConfig: ProfileFieldConfig,
): number => {
  const enabled = industries
    .filter((i) => i.isEnabled)
    .sort((a, b) => a.name.localeCompare(b.name));

  const headers = ["#", "Industry", "Onboarding Question", "Location Question"];
  const rows: string[][] = [];

  for (let idx = 0; idx < enabled.length; idx++) {
    const industry = enabled[idx];

    // Get essential questions (excluding canBeHomeBased which maps to location)
    const onboardingQs = getOnboardingQuestionsForIndustry(industry, profileConfig);
    const onboardingText =
      onboardingQs.length > 0 ? onboardingQs.map((q) => q.questionText).join("; ") : "N/A";

    // Location question
    const locationText = industry.industryOnboardingQuestions.canBeHomeBased
      ? getQuestionText("homeBasedBusiness", profileConfig)
      : "Assumed to have physical space";

    rows.push([String(idx + 1), industry.name, onboardingText, locationText]);
  }

  writeCsv(fileSystem, "report_industry_overview.csv", headers, rows);
  return rows.length;
};

// ============================================================================
// REPORT 2: Industry Tasks (Unique Tasks Matrix)
// ============================================================================

/**
 * Generates Report 2: Industry Tasks.
 * A matrix with industries as columns and unique (non-common) tasks as rows per industry.
 *
 * @param fileSystem - File system operations
 * @param industries - All loaded industries
 * @param taskNameIndex - Map of task filename to display name
 * @param baselineTasks - Set of common task filenames
 * @returns Number of industries with unique tasks
 */
const generateIndustryTasks = (
  fileSystem: FileSystemPort,
  industries: Industry[],
  taskNameIndex: Map<string, string>,
  baselineTasks: Set<string>,
): number => {
  const enabled = industries
    .filter((i) => i.isEnabled)
    .sort((a, b) => a.name.localeCompare(b.name));

  // For each industry, collect its unique tasks
  const industryUniqueTasks: Array<{ name: string; tasks: string[] }> = [];
  let maxUniqueTasks = 0;

  for (const industry of enabled) {
    const uniqueTasks: string[] = [];
    for (const step of industry.roadmapSteps) {
      const filename = getTaskFilenameFromStep(step);
      if (filename && !baselineTasks.has(filename)) {
        const displayName = taskNameIndex.get(filename) ?? `[${filename}]`;
        uniqueTasks.push(displayName);
      }
    }
    industryUniqueTasks.push({ name: industry.name, tasks: uniqueTasks });
    maxUniqueTasks = Math.max(maxUniqueTasks, uniqueTasks.length);
  }

  // Build matrix: each column is an industry, rows are unique tasks
  const headers = industryUniqueTasks.map((i) => i.name);
  const rows: string[][] = [];

  for (let rowIdx = 0; rowIdx < maxUniqueTasks; rowIdx++) {
    const row: string[] = [];
    for (const industry of industryUniqueTasks) {
      row.push(industry.tasks[rowIdx] ?? "");
    }
    rows.push(row);
  }

  writeCsv(fileSystem, "report_industry_tasks.csv", headers, rows);

  const withUnique = industryUniqueTasks.filter((i) => i.tasks.length > 0).length;
  return withUnique;
};

// ============================================================================
// REPORT 3: Business Structure Tasks
// ============================================================================

/**
 * Generates Report 3: Business Structure Tasks.
 * Shows which tasks are added by each legal structure (from add-ons).
 *
 * @param fileSystem - File system operations
 * @param addOnIndex - Map of add-on ID to IndustryRoadmap
 * @param taskNameIndex - Map of task filename to display name
 * @returns Number of legal structures reported
 */
const generateBusinessStructureTasks = (
  fileSystem: FileSystemPort,
  addOnIndex: Map<string, IndustryRoadmap>,
  taskNameIndex: Map<string, string>,
): number => {
  const headers: string[] = [];
  const structureTasks: string[][] = [];
  let maxTasks = 0;

  for (const ls of LegalStructures) {
    headers.push(`${ls.name} (${ls.abbreviation})`);
    const addOnIds = getLegalStructureAddOnIds(ls.id);
    const tasks: string[] = [];

    for (const addOnId of addOnIds) {
      const addOn = addOnIndex.get(addOnId);
      if (addOn) {
        for (const step of addOn.roadmapSteps) {
          const filename = getTaskFilenameFromStep(step);
          if (filename) {
            tasks.push(taskNameIndex.get(filename) ?? `[${filename}]`);
          }
        }
      }
    }

    structureTasks.push(tasks);
    maxTasks = Math.max(maxTasks, tasks.length);
  }

  // Build rows (each row has one cell per legal structure)
  const rows: string[][] = [];
  for (let rowIdx = 0; rowIdx < maxTasks; rowIdx++) {
    const row: string[] = [];
    for (const tasks of structureTasks) {
      row.push(tasks[rowIdx] ?? "");
    }
    rows.push(row);
  }

  writeCsv(fileSystem, "report_business_structure_tasks.csv", headers, rows);
  return LegalStructures.length;
};

// ============================================================================
// REPORT 4: Home-Based Tasks
// ============================================================================

/**
 * Generates Report 4: Home-Based Tasks.
 * Shows standard (non-home-based) tasks vs specialized home-based tasks,
 * plus which industries have transportation-related home-based logic.
 *
 * @param fileSystem - File system operations
 * @param industries - All loaded industries
 * @param addOnIndex - Map of add-on ID to IndustryRoadmap
 * @param taskNameIndex - Map of task filename to display name
 * @returns Number of rows generated
 */
const generateHomeBasedTasks = (
  fileSystem: FileSystemPort,
  industries: Industry[],
  addOnIndex: Map<string, IndustryRoadmap>,
  taskNameIndex: Map<string, string>,
): number => {
  // Standard tasks from permanent-location-business add-on
  const permLocation = addOnIndex.get(PERMANENT_LOCATION_ADDON_ID);
  const standardTasks: string[] = [];
  if (permLocation) {
    for (const step of permLocation.roadmapSteps) {
      const filename = getTaskFilenameFromStep(step);
      if (filename) {
        standardTasks.push(taskNameIndex.get(filename) ?? `[${filename}]`);
      }
    }
  }

  // Specialized task from home-based-transportation add-on
  const homeTransport = addOnIndex.get(HOME_BASED_TRANSPORTATION_ADDON_ID);
  const specializedTasks: string[] = [];
  if (homeTransport) {
    for (const step of homeTransport.roadmapSteps) {
      const filename = getTaskFilenameFromStep(step);
      if (filename) {
        specializedTasks.push(taskNameIndex.get(filename) ?? `[${filename}]`);
      }
    }
  }

  // Industries with isTransportation=true
  const transportIndustries = industries
    .filter((i) => i.isEnabled && i.industryOnboardingQuestions.isTransportation)
    .map((i) => i.name)
    .sort();

  const headers = [
    "Standard Tasks (No to home-based)",
    "Specialized Task (Yes to home-based)",
    "Industries",
  ];
  const maxRows = Math.max(
    standardTasks.length,
    specializedTasks.length,
    transportIndustries.length,
  );
  const rows: string[][] = [];

  for (let i = 0; i < maxRows; i++) {
    rows.push([standardTasks[i] ?? "", specializedTasks[i] ?? "", transportIndustries[i] ?? ""]);
  }

  writeCsv(fileSystem, "report_home_based_tasks.csv", headers, rows);
  return rows.length;
};

// ============================================================================
// REPORT 5: Industry Logic Map (Full)
// ============================================================================

/**
 * Generates Report 5: Industry Logic Map (Full).
 * For each enabled industry x each legal structure, shows the complete roadmap
 * with step numbers, task names, required flags, and uniqueness markers.
 *
 * @param fileSystem - File system operations
 * @param industries - All loaded industries
 * @param addOnIndex - Map of add-on ID to IndustryRoadmap
 * @param taskNameIndex - Map of task filename to display name
 * @param baselineTasks - Set of common task filenames
 * @param profileConfig - Profile field configuration for question text lookup
 * @returns Number of industry-structure combinations reported
 */
const generateLogicMapFull = (
  fileSystem: FileSystemPort,
  industries: Industry[],
  addOnIndex: Map<string, IndustryRoadmap>,
  taskNameIndex: Map<string, string>,
  baselineTasks: Set<string>,
  profileConfig: ProfileFieldConfig,
): number => {
  const enabled = industries
    .filter((i) => i.isEnabled)
    .sort((a, b) => a.name.localeCompare(b.name));

  const headers = [
    "Industry",
    "Essential Questions",
    "Business Structure",
    "Dialogue Prompt Questions",
    "Step",
    "Roadmap Task",
    "Required",
    "Unique Industry Task",
  ];
  const rows: string[][] = [];
  let combinationCount = 0;

  for (const industry of enabled) {
    const essentialQs = getOnboardingQuestionsForIndustry(industry, profileConfig);
    const essentialQText = essentialQs.map((q) => q.questionText).join("; ") || "N/A";

    // Location/home-based question
    const locationText = industry.industryOnboardingQuestions.canBeHomeBased
      ? getQuestionText("homeBasedBusiness", profileConfig)
      : "";

    const dialoguePrompts = [essentialQText, locationText].filter(Boolean).join("; ");

    for (const ls of LegalStructures) {
      const roadmap = buildFullRoadmap(industry, ls.id, addOnIndex, taskNameIndex, baselineTasks);

      // First row for this combination includes industry/structure info
      const isFirst = true;
      for (let i = 0; i < roadmap.length; i++) {
        const step = roadmap[i];
        rows.push([
          i === 0 ? industry.name : "",
          i === 0 ? essentialQText : "",
          i === 0 ? ls.name : "",
          i === 0 ? dialoguePrompts : "",
          String(step.step),
          step.taskName,
          step.required ? "Yes" : "No",
          step.isUnique ? "Yes" : "No",
        ]);
      }

      // Add blank separator row between combinations
      rows.push(Array(headers.length).fill(""));
      combinationCount++;
    }
  }

  writeCsv(fileSystem, "report_logic_map_llc.csv", headers, rows);
  return combinationCount;
};

// ============================================================================
// REPORT 6: Industry Logic Map v2 (Unique Only)
// ============================================================================

/**
 * Generates Report 6: Industry Logic Map v2 (Simplified).
 * Shows only unique tasks per industry, plus applicable non-essential and
 * essential questions.
 *
 * @param fileSystem - File system operations
 * @param industries - All loaded industries
 * @param taskNameIndex - Map of task filename to display name
 * @param baselineTasks - Set of common task filenames
 * @param profileConfig - Profile field configuration for question text lookup
 * @param nonEssentialQuestions - Array of non-essential question objects
 * @returns Number of industries reported
 */
const generateLogicMapUnique = (
  fileSystem: FileSystemPort,
  industries: Industry[],
  taskNameIndex: Map<string, string>,
  baselineTasks: Set<string>,
  profileConfig: ProfileFieldConfig,
  nonEssentialQuestions: NonEssentialQuestion[],
): number => {
  const enabled = industries
    .filter((i) => i.isEnabled)
    .sort((a, b) => a.name.localeCompare(b.name));

  const neqIndex = new Map<string, NonEssentialQuestion>();
  for (const neq of nonEssentialQuestions) {
    neqIndex.set(neq.id, neq);
  }

  const headers = ["Industry / Questions", "Tasks"];
  const rows: string[][] = [];
  let industryCount = 0;

  for (const industry of enabled) {
    // Get unique tasks
    const uniqueTasks: string[] = [];
    for (const step of industry.roadmapSteps) {
      const filename = getTaskFilenameFromStep(step);
      if (filename && !baselineTasks.has(filename)) {
        const displayName = taskNameIndex.get(filename) ?? `[${filename}]`;
        uniqueTasks.push(displayName);
      }
    }

    // Get essential questions
    const essentialQs = getOnboardingQuestionsForIndustry(industry, profileConfig);

    // Get non-essential questions
    const neqs = industry.nonEssentialQuestionsIds
      .map((id) => neqIndex.get(id.trim()))
      .filter((q): q is NonEssentialQuestion => q !== undefined);

    const hasContent = uniqueTasks.length > 0 || essentialQs.length > 0 || neqs.length > 0;
    if (!hasContent) {
      continue;
    }

    // Industry header row
    rows.push([industry.name, ""]);
    industryCount++;

    // Unique tasks
    for (const taskName of uniqueTasks) {
      rows.push(["", taskName]);
    }

    // Essential questions
    for (const q of essentialQs) {
      rows.push([q.questionText, ""]);
    }

    // Location question
    if (industry.industryOnboardingQuestions.canBeHomeBased) {
      const locationText = getQuestionText("homeBasedBusiness", profileConfig);
      rows.push([locationText, ""]);
      rows.push(["No", "[Standard non home-based business tasks]"]);
    }

    // Non-essential questions
    for (const neq of neqs) {
      rows.push([stripMarkdownLinks(neq.questionText), ""]);
    }

    // Blank separator
    rows.push(["", ""]);
  }

  writeCsv(fileSystem, "report_logic_map_v2.csv", headers, rows);
  return industryCount;
};

// ============================================================================
// ENTRY POINT
// ============================================================================

/**
 * Main entry point. Runs the content build to ensure industry.json is current,
 * then loads all data sources and generates all 6 reports.
 */
const main = (): void => {
  console.log("=== Content Logic Map Report Generator ===\n");

  // Step 1: Run content build to ensure industry.json is current
  console.log("Running content build...");
  buildContent();
  console.log("");

  // Step 2: Create file system port and ensure output directory
  const fileSystem = createFileSystemPort();
  fileSystem.ensureDirectory(REPORTS_DIR);

  // Step 3: Load all data sources
  console.log("Loading data sources...");
  const industries = loadIndustries(fileSystem);
  const profileConfig = loadProfileFieldConfig(fileSystem);
  const nonEssentialQuestions = loadNonEssentialQuestions(fileSystem);
  const allTasks = loadAllTasks(false);
  const allAddOns = loadAllAddOns(false);

  const taskNameIndex = buildTaskNameIndex(allTasks);
  const addOnIndex = buildAddOnIndex(allAddOns);
  const baselineTasks = getGenericBaselineTasks(industries, addOnIndex);

  const enabledCount = industries.filter((i) => i.isEnabled).length;
  console.log(`  Industries: ${industries.length} total, ${enabledCount} enabled`);
  console.log(`  Tasks: ${allTasks.length}`);
  console.log(`  Add-ons: ${allAddOns.length}`);
  console.log(`  Baseline (common) tasks: ${baselineTasks.size}`);
  console.log("");

  // Step 4: Generate reports
  console.log("Generating reports...");

  const report1Count = generateIndustryOverview(fileSystem, industries, profileConfig);
  console.log(`  Report 1 (Industry Overview): ${report1Count} industries`);

  const report2Count = generateIndustryTasks(fileSystem, industries, taskNameIndex, baselineTasks);
  console.log(`  Report 2 (Industry Tasks): ${report2Count} industries with unique tasks`);

  const report3Count = generateBusinessStructureTasks(fileSystem, addOnIndex, taskNameIndex);
  console.log(`  Report 3 (Business Structure Tasks): ${report3Count} legal structures`);

  const report4Count = generateHomeBasedTasks(fileSystem, industries, addOnIndex, taskNameIndex);
  console.log(`  Report 4 (Home-Based Tasks): ${report4Count} rows`);

  const report5Count = generateLogicMapFull(
    fileSystem,
    industries,
    addOnIndex,
    taskNameIndex,
    baselineTasks,
    profileConfig,
  );
  console.log(`  Report 5 (Logic Map Full): ${report5Count} industry x structure combinations`);

  const report6Count = generateLogicMapUnique(
    fileSystem,
    industries,
    taskNameIndex,
    baselineTasks,
    profileConfig,
    nonEssentialQuestions,
  );
  console.log(`  Report 6 (Logic Map Unique): ${report6Count} industries`);

  console.log(`\nAll reports written to: ${REPORTS_DIR}`);
};

main();
