/**
 * Reports entries within a single CMS collection that declare the same `slug` or `urlSlug` in
 * their file metadata. Those values are the public URL segment for an entry.
 */

import matter from "gray-matter";
import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CONFIG_FILE = "web/public/mgmt/config.yml";
const SLUG_FIELDS = ["slug", "urlSlug"] as const; // not standardized and used interchangably

type SlugField = (typeof SLUG_FIELDS)[number];

interface CollectionConfig {
  readonly extension?: string;
  readonly fields?: readonly { readonly name?: string }[];
  readonly folder?: string;
  readonly name: string;
}

type FolderCollection = CollectionConfig & { readonly folder: string };

interface Entry {
  readonly data: Record<string, unknown>;
  readonly location: string;
}

interface Declaration {
  readonly location: string;
  readonly value: string;
}

interface Duplicate {
  readonly collection: string;
  readonly declarations: readonly Declaration[];
  readonly slugField: SlugField;
  readonly value: string;
}

interface Report {
  readonly checkedCount: number;
  readonly collectionCount: number;
  readonly duplicates: readonly Duplicate[];
}

const loadCollections = (): CollectionConfig[] => {
  const parsed = yaml.load(fs.readFileSync(CONFIG_FILE, "utf8")) as {
    readonly collections?: readonly CollectionConfig[];
  } | null;
  return [...(parsed?.collections ?? [])];
};

const isCollectionLabel = (collection: CollectionConfig): boolean =>
  (collection.fields ?? []).every((field) => !field.name);

const isFolderCollection = (collection: CollectionConfig): collection is FolderCollection =>
  Boolean(collection.folder) && !isCollectionLabel(collection);

const readEntryData = (filePath: string): Record<string, unknown> => {
  const contents = fs.readFileSync(filePath, "utf8");
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".json") {
    return JSON.parse(contents) as Record<string, unknown>;
  }
  // if not json assumes md
  return matter(contents).data;
};

const readEntries = (folder: string, extension: string): Entry[] =>
  fs
    .readdirSync(folder)
    .filter((name: string) => name.endsWith(`.${extension}`))
    .map((name: string) => {
      const location = path.join(folder, name);
      return { data: readEntryData(location), location };
    });

const normalize = (value: unknown): string => String(value).trim().toLowerCase();

const findDuplicates = (
  declarations: readonly Declaration[],
): Map<string, readonly Declaration[]> => {
  const byValue = new Map<string, Declaration[]>();
  for (const declaration of declarations) {
    const key = normalize(declaration.value);
    byValue.set(key, [...(byValue.get(key) ?? []), declaration]);
  }
  return new Map([...byValue].filter(([, group]) => group.length > 1));
};

const checkSlugCollisions = (): Report => {
  const collections = loadCollections();
  const toBeChecked = collections.filter(isFolderCollection);
  const duplicates: Duplicate[] = [];

  for (const collection of toBeChecked) {
    const folder = collection.folder;
    const entries = readEntries(folder, collection.extension ?? "md");

    for (const slugField of SLUG_FIELDS) {
      const declarations = entries
        .filter((entry) => entry.data[slugField])
        .map((entry) => ({
          location: entry.location,
          value: String(entry.data[slugField]),
        }));

      for (const [value, group] of findDuplicates(declarations)) {
        duplicates.push({
          collection: collection.name,
          declarations: group,
          slugField,
          value,
        });
      }
    }
  }

  return {
    checkedCount: toBeChecked.length,
    collectionCount: collections.length,
    duplicates,
  };
};

const run = (): void => {
  const report = checkSlugCollisions();

  for (const duplicate of report.duplicates) {
    const { collection, declarations, slugField, value } = duplicate;
    console.log(`\n  ${collection} — ${slugField} "${value}" declared by ${declarations.length}:`);
    for (const declaration of declarations) {
      const raw = normalize(declaration.value) === value ? "" : ` (${declaration.value})`;
      console.log(`      ${declaration.location}${raw}`);
    }
  }

  console.log(
    `\nChecked ${report.checkedCount} collections of ${report.collectionCount} total collections`,
  );
  console.log(
    report.duplicates.length === 0
      ? "✅ No duplicates"
      : `❌ ${report.duplicates.length} duplicate slug value(s)`,
  );
  process.exitCode = report.duplicates.length === 0 ? 0 : 1;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run();
}
