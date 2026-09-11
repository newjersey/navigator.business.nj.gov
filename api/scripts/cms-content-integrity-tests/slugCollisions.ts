/**
 * Reports entries within a single CMS collection that declare the same `slug` or `urlSlug` in
 * their file metadata. Those values are the public URL segment for an entry.
 */

import { loadCmsConfig } from "@businessnjgovnavigator/shared/src/static";
import { publishSnsMessage } from "@libs/awsSns";
import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";

const SLUG_FIELDS = ["slug", "urlSlug"] as const; // not standardized and used interchangeably
const SLUG_COLLISION_TITLE = ":warning: CMS Slug Collision";

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

interface SlugCollision {
  readonly collection: string;
  readonly declarations: readonly Declaration[];
  readonly slugField: SlugField;
  readonly value: string;
}

export interface SlugCollisionReport {
  readonly checkedCount: number;
  readonly collectionCount: number;
  readonly collisions: readonly SlugCollision[];
}

const loadCollections = (): CollectionConfig[] => {
  const config = loadCmsConfig(true) as {
    readonly collections?: readonly CollectionConfig[];
  } | null;
  return [...(config?.collections ?? [])];
};

const isCollectionLabel = (collection: CollectionConfig): boolean =>
  (collection.fields ?? []).every((field) => !field.name);

const isFolderCollection = (collection: CollectionConfig): collection is FolderCollection =>
  Boolean(collection.folder) && !isCollectionLabel(collection);

const readEntryData = (filePath: string): Record<string, unknown> => {
  const contents = fs.readFileSync(filePath, "utf8");
  if (path.extname(filePath).toLowerCase() === ".json") {
    return JSON.parse(contents) as Record<string, unknown>;
  }
  // if not json assumes md
  return matter(contents).data;
};

const readEntries = (folder: string, extension: string): Entry[] => {
  const directory = path.join(process.cwd(), "..", folder);
  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(`.${extension}`))
    .map((name) => ({
      data: readEntryData(path.join(directory, name)),
      location: path.join(folder, name),
    }));
};

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

export const findSlugCollisions = (): SlugCollisionReport => {
  const collections = loadCollections();
  const toBeChecked = collections.filter((collection): collection is FolderCollection =>
    isFolderCollection(collection),
  );
  const collisions: SlugCollision[] = [];

  for (const collection of toBeChecked) {
    const entries = readEntries(collection.folder, collection.extension ?? "md");

    for (const slugField of SLUG_FIELDS) {
      const declarations = entries
        .filter((entry) => entry.data[slugField])
        .map((entry) => ({
          location: entry.location,
          value: String(entry.data[slugField]),
        }));

      for (const [value, group] of findDuplicates(declarations)) {
        collisions.push({
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
    collisions,
  };
};

const describeCollision = (collision: SlugCollision): string => {
  const locations = collision.declarations.map((declaration) => `*"${declaration.location}"*`);
  return `The *"${collision.collection}"* collection has ${collision.declarations.length} entries declaring the same ${collision.slugField} (*"${collision.value}"*): ${locations.join(", ")}. Entries cannot share a slug. Please update update the entries to differentiate.`;
};

export const logSlugCollisionReport = (report: SlugCollisionReport): void => {
  console.log(`Checked ${report.checkedCount} of ${report.collectionCount} total collections`);
  for (const collision of report.collisions) {
    console.error(describeCollision(collision));
  }
};

export const checkSlugCollisions = async (topicArn: string): Promise<boolean> => {
  console.log("\n Starting Check Slug Collisions");

  const report = findSlugCollisions();
  logSlugCollisionReport(report);

  for (const collision of report.collisions) {
    await publishSnsMessage(describeCollision(collision), topicArn, SLUG_COLLISION_TITLE);
  }

  return report.collisions.length > 0;
};
