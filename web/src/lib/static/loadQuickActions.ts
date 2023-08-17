import { QuickAction } from "@/lib/types/types";
import fs from "fs";
import path from "path";
import { convertQuickActionMd } from "../utils/markdownReader";

const quickActionsDir = path.join(process.cwd(), "..", "content", "src", "quick-actions");

export const loadAllQuickActions = (): QuickAction[] => {
  const fileNames = fs.readdirSync(quickActionsDir);
  return fileNames.map((fileName) => {
    return loadQuickActionsByFileName(fileName);
  });
};

export const loadQuickActionsByFileName = (fileName: string): QuickAction => {
  const fullPath = path.join(quickActionsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertQuickActionMd(fileContents, fileNameWithoutMd);
};
