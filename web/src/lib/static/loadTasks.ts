import { Task, TaskDependencies, TaskLink, TaskWithoutLinks } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

export type PathParams<P> = { params: P; locale?: string };
export type TaskUrlSlugParam = {
  taskUrlSlug: string;
};

const roadmapsDir = path.join(process.cwd(), "..", "content", "src", "roadmaps");
const tasksDirectory = path.join(roadmapsDir, "tasks");
const licenseDirectory = path.join(roadmapsDir, "license-tasks");

export const loadAllTaskUrlSlugs = (): PathParams<TaskUrlSlugParam>[] => {
  const taskFileNames = fs.readdirSync(tasksDirectory);
  const licenseFileNames = fs.readdirSync(licenseDirectory);

  return [
    ...taskFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, tasksDirectory),
      },
    })),
    ...licenseFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, licenseDirectory),
      },
    })),
  ];
};

export const loadTaskByUrlSlug = (urlSlug: string): Task => {
  try {
    const fileAsTask = getFileNameByUrlSlug(tasksDirectory, urlSlug);
    return loadTaskByFileName(fileAsTask, tasksDirectory);
  } catch {
    const fileAsLicense = getFileNameByUrlSlug(licenseDirectory, urlSlug);
    return loadTaskByFileName(fileAsLicense, licenseDirectory);
  }
};

const loadTaskByFileName = (fileName: string, directory: string): Task => {
  const fullPath = path.join(directory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const dependencies = JSON.parse(fs.readFileSync(path.join(roadmapsDir, "task-dependencies.json"), "utf8"))
    .dependencies as TaskDependencies[];

  const taskWithoutLinks = convertTaskMd(fileContents);
  const fileNameWithoutMd = fileName.split(".md")[0];
  const unlockedByTaskLinks = (
    dependencies.find((dependency) => {
      return dependency.name === fileNameWithoutMd;
    })?.dependencies || []
  ).map((dependencyFileName) => {
    return loadTaskLinkByFilename(dependencyFileName);
  });

  return {
    ...taskWithoutLinks,
    unlockedBy: unlockedByTaskLinks,
    filename: fileNameWithoutMd,
  } as Task;
};

const loadTaskLinkByFilename = (fileName: string): TaskLink => {
  let fileContents;
  try {
    fileContents = fs.readFileSync(path.join(tasksDirectory, `${fileName}.md`), "utf8");
  } catch {
    fileContents = fs.readFileSync(path.join(licenseDirectory, `${fileName}.md`), "utf8");
  }

  const taskWithoutLinks = convertTaskMd(fileContents) as TaskWithoutLinks;

  return {
    name: taskWithoutLinks.name,
    urlSlug: taskWithoutLinks.urlSlug,
    filename: fileName,
    id: taskWithoutLinks.id,
  };
};
