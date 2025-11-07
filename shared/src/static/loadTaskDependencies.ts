import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "roadmaps",
  "task-dependencies.json",
);

export const loadTaskDependenciesFile = (): Record<string, unknown> => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
};
