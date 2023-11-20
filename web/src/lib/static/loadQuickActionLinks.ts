import { QuickActionLink } from "@/lib/types/types";
import { convertQuickActionLinkMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

const quickActionsLinksDir = path.join(process.cwd(), "..", "content", "src", "quick-action-links");

export const loadAllQuickActionLinks = (): QuickActionLink[] => {
  const fileNames = fs.readdirSync(quickActionsLinksDir);

  return fileNames.map((fileName) => {
    return loadQuickActionLinksByFileName(fileName);
  });
};

const loadQuickActionLinksByFileName = (fileName: string): QuickActionLink => {
  const fullPath = path.join(quickActionsLinksDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertQuickActionLinkMd(fileContents, fileNameWithoutMd);
};
