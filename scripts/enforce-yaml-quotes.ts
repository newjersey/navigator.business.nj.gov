import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

const COLLECTIONS_DIR = path.resolve("web/decap-config/collections");

const enforceDoubleQuotesInYamlFiles = () => {
  const files = fs
    .readdirSync(COLLECTIONS_DIR)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

  if (files.length === 0) {
    console.log("No YAML files found in the collections directory.");
    return;
  }

  for (const file of files) {
    const filePath = path.join(COLLECTIONS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf8");

    try {
      const parsed = yaml.load(raw);
      const formatted = yaml.dump(parsed, {
        quotingType: '"',
        forceQuotes: true,
        lineWidth: 110,
      });

      fs.writeFileSync(filePath, formatted, "utf8");
      console.log(`✅ Enforced double quotes in: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to process ${file}:`, err);
    }
  }
};

enforceDoubleQuotesInYamlFiles();
