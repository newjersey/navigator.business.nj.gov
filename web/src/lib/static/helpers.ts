import { convertTaskMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

export const loadUrlSlugByFilename = (fileName: string, filingsDir: string): string => {
  const fullPath = path.join(filingsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const content = convertTaskMd(fileContents);
  return content.urlSlug;
};

export const getFileNameByUrlSlug = (currPath: string, urlSlug: string): string => {
  const fileNames = fs.readdirSync(currPath);
  const matchingFileName = fileNames.find((fileName) => {
    return urlSlug === loadUrlSlugByFilename(fileName, currPath);
  });
  if (!matchingFileName) {
    throw `Task with urlSlug ${urlSlug} not found`;
  }

  return matchingFileName;
};

// Function to load JSON files from a directory
export const loadJsonFiles = (directoryPath: string): Record<string, unknown>[] => {
  const jsonFiles: Record<string, unknown>[] = [];

  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);

    if (path.extname(file) === ".json") {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(fileContent);
      jsonFiles.push(jsonData);
    }
  }

  return jsonFiles;
};
