import fs from "node:fs";
import path from "node:path";
import { getMarkdown } from "@businessnjgovnavigator/shared/markdownReader";

export interface FrontmatterDateViolation {
  filePath: string;
  keyPath: string;
}

/**
 * Recursively finds native `Date` instances inside a parsed frontmatter
 * value (including nested objects and arrays), returning a
 * dotted/bracketed key path for each one found.
 */
export const findDatePaths = (value: unknown, keyPath = ""): string[] => {
  if (value instanceof Date) {
    return [keyPath || "(root)"];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findDatePaths(item, `${keyPath}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) =>
      findDatePaths(nested, keyPath ? `${keyPath}.${key}` : key),
    );
  }
  return [];
};

export interface MarkdownFileSystemPort {
  /** Returns the absolute paths of every `.md` file under `rootDir`. */
  listMarkdownFiles: (rootDir: string) => string[];
  readFile: (filePath: string) => string;
}

// No existing loader enumerates every content/src subdirectory (each one
// only knows its own content type), so this walks the filesystem directly
// to guarantee full coverage.
const listMarkdownFilesRecursively = (rootDir: string): string[] => {
  if (!fs.existsSync(rootDir)) return [];

  const results: string[] = [];
  const directoriesToVisit = [rootDir];

  while (directoriesToVisit.length > 0) {
    const currentDir = directoriesToVisit.pop() as string;
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        directoriesToVisit.push(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(entryPath);
      }
    }
  }

  return results;
};

export const createMarkdownFileSystemPort = (): MarkdownFileSystemPort => ({
  listMarkdownFiles: listMarkdownFilesRecursively,
  readFile: (filePath: string): string => fs.readFileSync(filePath, "utf8"),
});

export const formatFrontmatterDateViolationsMessage = (
  violations: FrontmatterDateViolation[],
): string => {
  return [
    `Found ${violations.length} unquoted date-like value(s) in content frontmatter.`,
    "YAML resolves an unquoted date (e.g. `date: 2025-09-03`) to a native Date object, " +
      "but every content type here declares date fields as `string`. Quote the value " +
      'instead (e.g. `date: "2025-09-03"`).',
    "",
    ...violations.map((violation) => `  ${violation.filePath}: ${violation.keyPath}`),
  ].join("\n");
};

export const validateNoDateObjectsInFrontmatter = (
  rootDir: string,
  fileSystem: MarkdownFileSystemPort = createMarkdownFileSystemPort(),
): void => {
  const violations: FrontmatterDateViolation[] = [];

  for (const filePath of fileSystem.listMarkdownFiles(rootDir)) {
    const { grayMatter } = getMarkdown(fileSystem.readFile(filePath));
    for (const keyPath of findDatePaths(grayMatter)) {
      violations.push({ filePath, keyPath });
    }
  }

  if (violations.length === 0) return;

  throw new Error(formatFrontmatterDateViolationsMessage(violations));
};

/* istanbul ignore next */
if (import.meta.url === `file://${process.argv[1]}`) {
  validateNoDateObjectsInFrontmatter(path.join(__dirname, "src"));
  console.log("✓ No unquoted dates found in content frontmatter");
}
