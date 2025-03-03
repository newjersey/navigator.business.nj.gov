import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { AnytimeActionTask } from "@/lib/types/types";
import { convertAnytimeActionTaskMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };
const anytimeActionsTaskDir = path.join(process.cwd(), "..", "content", "src", "anytime-action-tasks");

export type AnytimeActionTaskUrlSlugParam = {
  anytimeActionTaskUrlSlug: string;
};

export const loadAllAnytimeActionTasks = (): AnytimeActionTask[] => {
  const fileNames = fs.readdirSync(anytimeActionsTaskDir);

  return fileNames.map((fileName) => {
    return loadAnytimeActionTasksByFileName(fileName);
  });
};

export const loadAllAnytimeActionTaskUrlSlugs = (): PathParams<AnytimeActionTaskUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(anytimeActionsTaskDir);
  return fileNames.map((fileName) => {
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
