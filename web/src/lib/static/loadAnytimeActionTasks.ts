import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { AnytimeActionTask } from "@/lib/types/types";
import { convertAnytimeActionTaskMd } from "@/lib/utils/tasksMarkdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };
const anytimeActionsTaskDirApp = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks",
);
const anytimeActionsTaskDirTest = path.join(
  process.cwd(),
  "content",
  "src",
  "anytime-action-tasks",
);

export type AnytimeActionTaskUrlSlugParam = {
  anytimeActionTaskUrlSlug: string;
};

const getAnytimeActionsTaskDir = (isTest: boolean): string => {
  if (isTest) {
    return anytimeActionsTaskDirTest;
  }
  return anytimeActionsTaskDirApp;
};

export const loadAllAnytimeActionTasks = (isTest: boolean = false): AnytimeActionTask[] => {
  const fileNames = fs.readdirSync(getAnytimeActionsTaskDir(isTest));

  return fileNames.map((fileName) => {
    return loadAnytimeActionTasksByFileName(fileName);
  });
};

export const loadAllAnytimeActionTaskUrlSlugs = (
  isTest: boolean = false,
): PathParams<AnytimeActionTaskUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(getAnytimeActionsTaskDir(isTest));
  return fileNames.map((fileName) => {
    return {
      params: {
        anytimeActionTaskUrlSlug: loadUrlSlugByFilename(fileName, getAnytimeActionsTaskDir(isTest)),
      },
    };
  });
};

export const loadAnytimeActionTaskByUrlSlug = (
  urlSlug: string,
  isTest: boolean = false,
): AnytimeActionTask => {
  const matchingFileName = getFileNameByUrlSlug(getAnytimeActionsTaskDir(isTest), urlSlug);
  return loadAnytimeActionTasksByFileName(matchingFileName, isTest);
};

const loadAnytimeActionTasksByFileName = (
  fileName: string,
  isTest: boolean = false,
): AnytimeActionTask => {
  const fullPath = path.join(getAnytimeActionsTaskDir(isTest), `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionTaskMd(fileContents, fileNameWithoutMd, isTest);
};
