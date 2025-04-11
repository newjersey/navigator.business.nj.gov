import fs from "fs";
import yaml from "js-yaml";
import path from "path";

const baseConfigPath = "web/decap-config/config-base.yml";
const collectionsDir = "web/decap-config/collections";
const outputPath = "web/public/mgmt/config.yml";

// Load base config
const base = yaml.load(fs.readFileSync(baseConfigPath, "utf8"));

// Merge all collections
const files = fs.readdirSync(collectionsDir).filter((f) => f.endsWith(".yml"));
const collections = files.flatMap((file) => {
  const fullPath = path.join(collectionsDir, file);
  const content = yaml.load(fs.readFileSync(fullPath, "utf8"));
  return content.collections || [];
});

base.collections = collections;

// Output merged config
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, yaml.dump(base), "utf8");

console.log(`✅ Decap CMS config built: ${outputPath}`);
