/**
 * Frontmatter Date Validation
 *
 * Guards against a specific YAML pitfall: an unquoted ISO date in Markdown
 * frontmatter (e.g. `date: 2025-09-03`) parses to a native JS `Date` via
 * gray-matter/js-yaml, even though every content type in this repo declares
 * its date fields as `string`. A `Date` there silently breaks downstream
 * consumers that expect JSON-serializable data, most visibly Next.js's
 * `getStaticProps`, which fails the whole static export (see AB#17994,
 * caused by Decap CMS writing an unquoted date for a Recents entry).
 *
 * This module scans every Markdown file's frontmatter and fails loudly,
 * with the offending file and key path, instead of only surfacing the
 * problem much later at build/export time.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface FrontmatterDateViolation {
  filePath: string;
  keyPath: string;
}

/**
 * Recursively finds native `Date` instances anywhere inside a parsed
 * frontmatter value (including nested objects and arrays), returning a
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

/**
 * Validates that no Markdown frontmatter file under `rootDir` contains a
 * native `Date` value. Throws a single aggregated error listing every
 * offending file and key path when violations are found.
 */
export const validateNoDateObjectsInFrontmatter = (
  rootDir: string,
  fileSystem: MarkdownFileSystemPort = createMarkdownFileSystemPort(),
): void => {
  const violations: FrontmatterDateViolation[] = [];

  for (const filePath of fileSystem.listMarkdownFiles(rootDir)) {
    const { data } = matter(fileSystem.readFile(filePath));
    for (const keyPath of findDatePaths(data)) {
      violations.push({ filePath, keyPath });
    }
  }

  if (violations.length === 0) return;

  throw new Error(formatFrontmatterDateViolationsMessage(violations));
};

// Run as a standalone check (e.g. `yarn workspace @businessnjgovnavigator/content validate-frontmatter-dates`)
// when invoked directly, rather than only via the full content build.
/* istanbul ignore next */
if (import.meta.url === `file://${process.argv[1]}`) {
  validateNoDateObjectsInFrontmatter(path.join(__dirname, "src"));
  console.log("✓ No unquoted dates found in content frontmatter");
}
