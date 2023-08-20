import { ContextualInfoFile } from "@/lib/types/types";
import { convertContextualInfoMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

const contextualInfoDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "display-content",
  "contextual-information",
);
const archivedContextualInfoDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "display-content",
  "archived-contextual-info",
);

export const loadAllContextualInfo = (): ContextualInfoFile[] => {
  return loadContextualInfo(contextualInfoDir);
};

export const loadAllArchivedContextualInfo = (): ContextualInfoFile[] => {
  return loadContextualInfo(archivedContextualInfoDir);
};

const loadContextualInfo = (dir: string): ContextualInfoFile[] => {
  const fileNames = fs.readdirSync(dir);
  return fileNames.map((fileName) => {
    const fullPath = path.join(dir, `${fileName}`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const fileNameWithoutMd = fileName.split(".md")[0];
    return {
      ...convertContextualInfoMd(fileContents),
      filename: fileNameWithoutMd,
    };
  });
};
