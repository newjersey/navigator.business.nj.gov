import fs from "fs";
import path from "path";
import { AnytimeActionTask } from "@businessnjgovnavigator/shared/types/types";
import { convertAnytimeActionTaskMd } from "@businessnjgovnavigator/shared/utils/tasksMarkdownReader";
import {
  getFileNameByUrlSlug,
  loadUrlSlugByFilename,
} from "@businessnjgovnavigator/shared/static/helpers";

type PathParameters<P> = { params: P; locale?: string };
const anytimeActionsTaskDirectoryApp = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks",
);
const anytimeActionsTaskDirectoryTest = path.join(
  process.cwd(),
  "content",
  "src",
  "anytime-action-tasks",
);

export type AnytimeActionTaskUrlSlugParameter = {
  anytimeActionTaskUrlSlug: string;
};

const getAnytimeActionsTaskDirectory = (isTest: boolean): string => {
  if (isTest) {
    return anytimeActionsTaskDirectoryTest;
  }
  return anytimeActionsTaskDirectoryApp;
};

export const loadAllAnytimeActionTasks = (isTest: boolean = false): AnytimeActionTask[] => {
  const fileNames = fs.readdirSync(getAnytimeActionsTaskDirectory(isTest));

  return fileNames.map((fileName) => {
    return loadAnytimeActionTasksByFileName(fileName);
  });
};

export const loadAllAnytimeActionTaskUrlSlugs = (
  isTest: boolean = false,
): PathParameters<AnytimeActionTaskUrlSlugParameter>[] => {
  const fileNames = fs.readdirSync(getAnytimeActionsTaskDirectory(isTest));
  return fileNames.map((fileName) => {
    return {
      params: {
        anytimeActionTaskUrlSlug: loadUrlSlugByFilename(
          fileName,
          getAnytimeActionsTaskDirectory(isTest),
        ),
      },
    };
  });
};

export const loadAnytimeActionTaskByUrlSlug = (
  urlSlug: string,
  isTest: boolean = false,
): AnytimeActionTask => {
  const matchingFileName = getFileNameByUrlSlug(getAnytimeActionsTaskDirectory(isTest), urlSlug);
  return loadAnytimeActionTasksByFileName(matchingFileName, isTest);
};

export const loadAnytimeActionTasksByFileName = (
  fileName: string,
  isTest: boolean = false,
): AnytimeActionTask => {
  const fullPath = path.join(getAnytimeActionsTaskDirectory(isTest), `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionTaskMd(fileContents, fileNameWithoutMd, isTest);
};
