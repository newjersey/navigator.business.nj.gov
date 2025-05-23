import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { AnytimeActionCategoryMapping, AnytimeActionTask } from "@/lib/types/types";
import {
  convertAnytimeActionCategoryMd,
  convertAnytimeActionTaskMd,
} from "@/lib/utils/tasksMarkdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };
const anytimeActionsTaskDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks",
);

export type AnytimeActionTaskUrlSlugParam = {
  anytimeActionTaskUrlSlug: string;
};

export const loadAllAnytimeActionTasks = (): AnytimeActionTask[] => {
  const fileNames = fs.readdirSync(anytimeActionsTaskDir);

  return fileNames.map((fileName) => {
    return loadAnytimeActionTasksByFileName(fileName);
  });
};

export const loadAllAnytimeActionTaskUrlSlugs = (
  expection?: string,
): PathParams<AnytimeActionTaskUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(anytimeActionsTaskDir);
  let fileNamesWithoutExceptions = fileNames;
  if (expection) {
    fileNamesWithoutExceptions = fileNames.filter((e) => e !== expection);
  }

  return fileNamesWithoutExceptions.map((fileName) => {
    return {
      params: {
        anytimeActionTaskUrlSlug: loadUrlSlugByFilename(fileName, anytimeActionsTaskDir),
      },
    };
  });
};

export const loadAnytimeActionTaskByUrlSlug = (urlSlug: string): AnytimeActionTask => {
  const matchingFileName = getFileNameByUrlSlug(anytimeActionsTaskDir, urlSlug);
  return loadAnytimeActionTasksByFileName(matchingFileName);
};

const loadAnytimeActionTasksByFileName = (fileName: string): AnytimeActionTask => {
  const fullPath = path.join(anytimeActionsTaskDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionTaskMd(fileContents, fileNameWithoutMd);
};

export const loadAnytimeActionCategoryMappings = (): AnytimeActionCategoryMapping => {
  const anytimeActionsCatgoriesDir = path.join(
    process.cwd(),
    "..",
    "content",
    "src",
    "anytime-action-categories",
  );
  const fileNames = fs.readdirSync(anytimeActionsCatgoriesDir);

  const categoryArrayMapping = fileNames.map((fileName) => {
    return loadIndividualAnytimeActionCatgory(fileName, anytimeActionsCatgoriesDir);
  });

  let categoryArrayMappingTwo = {};

  for (const element of categoryArrayMapping) {
    categoryArrayMappingTwo = {
      ...categoryArrayMappingTwo,
      [element.id]: element.categoryName,
    };
  }

  return categoryArrayMappingTwo;
};

const loadIndividualAnytimeActionCatgory = (
  fileName: string,
  directory: string,
): AnytimeActionCategoryMapping => {
  const fullPath = path.join(directory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  return convertAnytimeActionCategoryMd(fileContents);
};
