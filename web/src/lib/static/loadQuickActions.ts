import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { QuickAction } from "@/lib/types/types";
import fs from "fs";
import path from "path";
import { convertQuickActionMd } from "../utils/markdownReader";

type PathParams<P> = { params: P; locale?: string };
const quickActionsDir = path.join(process.cwd(), "..", "content", "src", "quick-actions");

export type QuickActionUrlSlugParam = {
  quickActionUrlSlug: string;
};

export const loadAllQuickActions = (): QuickAction[] => {
  const fileNames = fs.readdirSync(quickActionsDir);
  return fileNames.map((fileName) => {
    return loadQuickActionsByFileName(fileName);
  });
};

export const loadAllQuickActionUrlSlugs = (): PathParams<QuickActionUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(quickActionsDir);
  return fileNames.map((fileName) => {
    return {
      params: {
        quickActionUrlSlug: loadUrlSlugByFilename(fileName, quickActionsDir),
      },
    };
  });
};

export const loadQuickActionByUrlSlug = (urlSlug: string): QuickAction => {
  const matchingFileName = getFileNameByUrlSlug(quickActionsDir, urlSlug);
  return loadQuickActionsByFileName(matchingFileName);
};

export const loadQuickActionsByFileName = (fileName: string): QuickAction => {
  const fullPath = path.join(quickActionsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertQuickActionMd(fileContents, fileNameWithoutMd);
};
