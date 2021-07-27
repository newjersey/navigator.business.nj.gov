import fs from "fs";
import path from "path";
import { Task } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export type PathParams<P> = { params: P; locale?: string };
export type TaskUrlSlugParam = {
  urlSlug: string;
};

const roadmapsDir = path.join(process.cwd(), "roadmaps");

export const loadAllTaskUrlSlugs = (): PathParams<TaskUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(path.join(roadmapsDir, "tasks"));

  return fileNames.map((fileName) => {
    const task = loadTaskByFileName(fileName);
    return {
      params: {
        urlSlug: task.urlSlug,
      },
    };
  });
};

export const loadTaskByUrlSlug = (urlSlug: string): Task => {
  const fileNames = fs.readdirSync(path.join(roadmapsDir, "tasks"));
  const matchingFileName = fileNames.find((fileName) => {
    const task = loadTaskByFileName(fileName);
    return urlSlug === task.urlSlug;
  });
  if (!matchingFileName) {
    throw `Task with urlSlug ${urlSlug} not found`;
  }
  return loadTaskByFileName(matchingFileName);
};

const loadTaskByFileName = (fileName: string): Task => {
  const fullPath = path.join(roadmapsDir, "tasks", `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return convertTaskMd(fileContents);
};
