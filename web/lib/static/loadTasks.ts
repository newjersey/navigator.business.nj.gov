import fs from "fs";
import path from "path";
import { Task, TaskDependencies, TaskLink } from "@/lib/types/types";
import { convertTaskMd, TaskWithoutLinks } from "@/lib/utils/markdownReader";
import { loadUrlSlugByFilename, getFileNameByUrlSlug } from "./helpers";

export type PathParams<P> = { params: P; locale?: string };
export type TaskUrlSlugParam = {
  taskUrlSlug: string;
};

const roadmapsDir = path.join(process.cwd(), "..", "content", "src", "roadmaps");

export const loadAllTaskUrlSlugs = (): PathParams<TaskUrlSlugParam>[] => {
  const directory = path.join(roadmapsDir, "tasks");
  const fileNames = fs.readdirSync(directory);
  return fileNames.map((fileName) => {
    return {
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, directory),
      },
    };
  });
};

export const loadTaskByUrlSlug = (urlSlug: string): Task => {
  const currPath = path.join(roadmapsDir, "tasks");
  const matchingFileName = getFileNameByUrlSlug(currPath, urlSlug);
  return loadTaskByFileName(matchingFileName);
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
  } as Task;
};

const loadTaskLinkByFilename = (fileName: string): TaskLink => {
  const fullPath = path.join(roadmapsDir, "tasks", `${fileName}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const taskWithoutLinks = convertTaskMd(fileContents) as TaskWithoutLinks;

  return {
    name: taskWithoutLinks.name,
    urlSlug: taskWithoutLinks.urlSlug,
    filename: fileName,
    id: taskWithoutLinks.id,
  };
};
