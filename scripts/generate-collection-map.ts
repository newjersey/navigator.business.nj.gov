import fs from "fs";
import path from "path";
import yaml from "yaml";
const collectionDirectory = "web/decap-config/collections";
const output = "web/src/lib/cms/CollectionMap.json";

const map = {};
for (const collection of fs.readdirSync(collectionDirectory)) {
  if (!collection.endsWith(".yml")) {
    continue;
  }
  const data = yaml.parse(fs.readFileSync(path.join(collectionDirectory, collection), "utf-8"));
  const collectionData = data.collections;

  for (const section of collectionData) {
    if (section.name.endsWith("-label")) continue;

    const label = section.label;
    const collectionName = section["name"];

    if (section.folder) {
      const directory = section.folder;
      const filesInDirectory = fs.readdirSync(directory);
      for (const file of filesInDirectory) {
        const fileName = file.split(".")[0];
        if (!map[fileName]) {
          map[fileName] = {};
        }
        map[fileName][label] = collectionName;
      }
    }

    if (section.files) {
      for (const file of section.files) {
        if (!map[file.name]) {
          map[file.name] = {};
        }
        map[file.name][label] = collectionName;
      }
    }
  }
}
fs.writeFileSync(output, JSON.stringify(map, null, 2));
console.log(`✅ CMS Map built: ${output}`);
