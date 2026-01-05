import fs from "fs";
import yaml from "js-yaml";
import path from "path";

// Function to read all YAML files in a directory and parse them
export const loadYamlFiles = (): Record<string, unknown>[] => {
  // Find the correct path based on where tests are running from
  const possiblePaths = [
    path.join(process.cwd(), "decap-config", "collections"),
    path.join(process.cwd(), "web", "decap-config", "collections"),
    path.join(process.cwd(), "..", "web", "decap-config", "collections"),
  ];

  let directoryPath: string | undefined;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      directoryPath = p;
      break;
    }
  }

  if (!directoryPath) {
    throw new Error(
      `Could not find decap-config/collections directory. Tried: ${possiblePaths.join(", ")}`,
    );
  }

  const files = fs.readdirSync(directoryPath);
  const yamlFiles = files.filter(
    (file) => path.extname(file) === ".yml" || path.extname(file) === ".yaml",
  );

  const parsedData: Record<string, unknown>[] = yamlFiles.map((file) => {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContent) as Record<string, unknown>;
  });

  return parsedData;
};
