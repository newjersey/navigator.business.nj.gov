import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { QuickActionTask } from "@/lib/types/types";
import { convertQuickActionTaskMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };
const quickActionsTaskDir = path.join(process.cwd(), "..", "content", "src", "quick-action-tasks");

export type QuickActionTaskUrlSlugParam = {
  quickActionTaskUrlSlug: string;
};

export const loadAllQuickActionTasks = (): QuickActionTask[] => {
  const fileNames = fs.readdirSync(quickActionsTaskDir);

  return fileNames.map((fileName) => {
    return loadQuickActionTasksByFileName(fileName);
  });
};

export const loadAllQuickActionTaskUrlSlugs = (): PathParams<QuickActionTaskUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(quickActionsTaskDir);
  return fileNames.map((fileName) => {
    return {
      params: {
        quickActionTaskUrlSlug: loadUrlSlugByFilename(fileName, quickActionsTaskDir),
      },
    };
  });
};

export const loadQuickActionTaskByUrlSlug = (urlSlug: string): QuickActionTask => {
  const matchingFileName = getFileNameByUrlSlug(quickActionsTaskDir, urlSlug);
  return loadQuickActionTasksByFileName(matchingFileName);
};

const loadQuickActionTasksByFileName = (fileName: string): QuickActionTask => {
  const fullPath = path.join(quickActionsTaskDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertQuickActionTaskMd(fileContents, fileNameWithoutMd);
};
