import fs from "fs";
import path from "path";
import { convertContextualInfoMd } from "../markdownReader";
import { ContextualInfoFile } from "../types/types";

const contextualInfoDirectory = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "display-content",
  "contextual-information",
);
const archivedContextualInfoDirectory = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "display-content",
  "archived-contextual-info",
);

export const loadAllContextualInfo = (): ContextualInfoFile[] => {
  return loadContextualInfo(contextualInfoDirectory);
};

export const loadAllArchivedContextualInfo = (): ContextualInfoFile[] => {
  return loadContextualInfo(archivedContextualInfoDirectory);
};

const loadContextualInfo = (directory: string): ContextualInfoFile[] => {
  const fileNames = fs.readdirSync(directory);
  return fileNames.map((fileName) => {
    const fullPath = path.join(directory, `${fileName}`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const fileNameWithoutMd = fileName.split(".md")[0];
    return {
      ...convertContextualInfoMd(fileContents),
      filename: fileNameWithoutMd,
    };
  });
};
