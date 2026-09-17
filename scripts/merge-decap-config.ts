import * as fs from "fs";
import * as yaml from "js-yaml";
import { fileURLToPath } from "node:url";
import * as path from "path";
import { buildMunicipalityCmsOptions, Municipalities } from "../shared/src/municipality";

const baseConfigPath = "web/decap-config/config-base.yml";
const collectionsDir = "web/decap-config/collections";
const outputPath = "web/public/mgmt/config.yml";

const municipalityOptionsSentinel = "$generated:municipalities";

interface CollectionField {
  name: string;
  options?: unknown;
  [key: string]: unknown;
}

interface CollectionEntry {
  name: string;
  fields?: CollectionField[];
  [key: string]: unknown;
}

interface DecapConfig {
  [key: string]: unknown;
  collections?: CollectionEntry[];
}

const loadCollections = (): CollectionEntry[] => {
  const files = fs.readdirSync(collectionsDir).filter((file) => file.endsWith(".yml"));
  return files.flatMap((file) => {
    const fullPath = path.join(collectionsDir, file);
    const content = yaml.load(fs.readFileSync(fullPath, "utf8")) as {
      collections?: CollectionEntry[];
    };
    return content.collections || [];
  });
};

const run = (): void => {
  const base = yaml.load(fs.readFileSync(baseConfigPath, "utf8")) as DecapConfig;
  const collections = loadCollections();

  const municipalityFields = collections
    .flatMap((collection) => collection.fields ?? [])
    .filter((field) => field.options === municipalityOptionsSentinel);
  if (municipalityFields.length === 0) {
    throw new Error(`No Decap field declares options: "${municipalityOptionsSentinel}"`);
  }

  const municipalityOptions = buildMunicipalityCmsOptions(Object.values(Municipalities));
  for (const field of municipalityFields) {
    field.options = municipalityOptions;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, yaml.dump({ ...base, collections }), "utf8");

  console.log(`✅ Decap CMS config built: ${outputPath}`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run();
}
