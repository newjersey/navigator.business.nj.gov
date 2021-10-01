import fs from "fs";
import path from "path";
import { Task, TaskDependencies, TaskLink } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export type PathParams<P> = { params: P; locale?: string };
export type TaskUrlSlugParam = {
  urlSlug: string;
};

const roadmapsDir = path.join(process.cwd(), "roadmaps");

export const loadAllTaskUrlSlugs = (): PathParams<TaskUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(path.join(roadmapsDir, "tasks"));

  return fileNames.map((fileName) => {
    return {
      params: {
        urlSlug: loadUrlSlugByFilename(fileName),
      },
    };
  });
};

export const loadTaskByUrlSlug = (urlSlug: string): Task => {
  const fileNames = fs.readdirSync(path.join(roadmapsDir, "tasks"));
  const matchingFileName = fileNames.find((fileName) => {
    return urlSlug === loadUrlSlugByFilename(fileName);
  });
  if (!matchingFileName) {
    throw `Task with urlSlug ${urlSlug} not found`;
  }
  return loadTaskByFileName(matchingFileName);
};

const loadUrlSlugByFilename = (fileName: string): string => {
  const fullPath = path.join(roadmapsDir, "tasks", `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return convertTaskMd(fileContents).urlSlug;
};

const loadTaskByFileName = (fileName: string): Task => {
  const fullPath = path.join(roadmapsDir, "tasks", `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const dependencies = JSON.parse(
    fs.readFileSync(path.join(roadmapsDir, "task-dependencies.json"), "utf8")
  ) as TaskDependencies;

  const taskWithoutLinks = convertTaskMd(fileContents);
  const fileNameWithoutMd = fileName.split(".md")[0];
  const unlockedByTaskLinks = (dependencies[fileNameWithoutMd] || []).map((dependencyFileName) =>
    loadTaskLinkByFilename(dependencyFileName)
  );

  const unlocksFilenames = Object.keys(dependencies).filter((filename) =>
    dependencies[filename].includes(fileNameWithoutMd)
  );
  const unlocksTaskLinks = unlocksFilenames.map((fileName) => loadTaskLinkByFilename(fileName));

  return {
    ...taskWithoutLinks,
    unlockedBy: unlockedByTaskLinks,
    unlocks: unlocksTaskLinks,
    filename: fileNameWithoutMd,
  };
};

const loadTaskLinkByFilename = (fileName: string): TaskLink => {
  const fullPath = path.join(roadmapsDir, "tasks", `${fileName}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const taskWithoutLinks = convertTaskMd(fileContents);

  return {
    name: taskWithoutLinks.name,
    urlSlug: taskWithoutLinks.urlSlug,
    filename: fileName,
  };
};
