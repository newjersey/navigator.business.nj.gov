import fs from "fs";
import path from "path";
import { AnytimeActionTask } from "../types/types";
import { convertAnytimeActionTaskMd } from "../utils/tasksMarkdownReader";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParameters<P> = { params: P; locale?: string };

// Helper to find content directory from different test contexts
const findContentDirectory = (): string => {
  const possiblePaths = [
    path.join(process.cwd(), "..", "content", "src", "anytime-action-tasks"),
    path.join(process.cwd(), "content", "src", "anytime-action-tasks"),
    path.join(process.cwd(), "..", "..", "content", "src", "anytime-action-tasks"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    `Could not find content/src/anytime-action-tasks directory. Tried: ${possiblePaths.join(", ")}`,
  );
};

let anytimeActionsTaskDirectoryApp: string | undefined;
let anytimeActionsTaskDirectoryTest: string | undefined;

export type AnytimeActionTaskUrlSlugParameter = {
  anytimeActionTaskUrlSlug: string;
};

const getAnytimeActionsTaskDirectory = (isTest: boolean): string => {
  if (isTest) {
    if (!anytimeActionsTaskDirectoryTest) {
      anytimeActionsTaskDirectoryTest = findContentDirectory();
    }
    return anytimeActionsTaskDirectoryTest;
  }
  if (!anytimeActionsTaskDirectoryApp) {
    anytimeActionsTaskDirectoryApp = findContentDirectory();
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
