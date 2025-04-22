import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

const baseConfigPath = "web/decap-config/config-base.yml";
const collectionsDir = "web/decap-config/collections";
const outputPath = "web/public/mgmt/config.yml";

interface CollectionEntry {
  name: string;
  [key: string]: unknown;
}

interface DecapConfig {
  [key: string]: unknown;
  collections?: CollectionEntry[];
}

// Load base config
const base = yaml.load(fs.readFileSync(baseConfigPath, "utf8")) as DecapConfig;

// Merge all collections
const files = fs.readdirSync(collectionsDir).filter((f) => f.endsWith(".yml"));
const collections: CollectionEntry[] = files.flatMap((file) => {
  const fullPath = path.join(collectionsDir, file);
  const content = yaml.load(fs.readFileSync(fullPath, "utf8")) as {
    collections?: CollectionEntry[];
  };
  return content.collections || [];
});

base.collections = collections;

// Output merged config with double quotes
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, yaml.dump(base), "utf8");

console.log(`✅ Decap CMS config built: ${outputPath}`);
