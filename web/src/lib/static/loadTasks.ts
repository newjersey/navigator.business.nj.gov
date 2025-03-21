import { Task, TaskDependencies, TaskLink, TaskWithoutLinks } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParams<P> = { params: P; locale?: string };
export type TaskUrlSlugParam = {
  taskUrlSlug: string;
};

const roadmapsDir = path.join(process.cwd(), "..", "content", "src", "roadmaps");
const tasksDirectory = path.join(roadmapsDir, "tasks");
const licenseDirectory = path.join(roadmapsDir, "license-tasks");
const municipalDirectory = path.join(roadmapsDir, "municipal-tasks");
const raffleBingoStepsDirectory = path.join(roadmapsDir, "raffle-bingo-steps");
const envDirectory = path.join(roadmapsDir, "env-tasks");

export const loadAllTaskUrlSlugs = (): PathParams<TaskUrlSlugParam>[] => {
  const taskFileNames = fs.readdirSync(tasksDirectory);
  const licenseFileNames = fs.readdirSync(licenseDirectory);
  const municipalFileNames = fs.readdirSync(municipalDirectory);
  const raffleBingoFileNames = fs.readdirSync(raffleBingoStepsDirectory);
  const envFileNames = fs.readdirSync(envDirectory);

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
    ...municipalFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, municipalDirectory),
      },
    })),
    ...raffleBingoFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, raffleBingoStepsDirectory),
      },
    })),
    ...envFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, envDirectory),
      },
    })),
  ];
};

export const loadAllTasks = (): Task[] => {
  const taskFileNames = fs.readdirSync(tasksDirectory);
  const licenseFileNames = fs.readdirSync(licenseDirectory);
  const municipalFileNames = fs.readdirSync(municipalDirectory);
  const raffleBingoFileNames = fs.readdirSync(raffleBingoStepsDirectory);
  const envFileNames = fs.readdirSync(envDirectory);

  return [
    ...taskFileNames.map((fileName) => loadTaskByFileName(fileName, tasksDirectory)),
    ...licenseFileNames.map((fileName) => loadTaskByFileName(fileName, licenseDirectory)),
    ...municipalFileNames.map((fileName) => loadTaskByFileName(fileName, municipalDirectory)),
    ...raffleBingoFileNames.map((fileName) => loadTaskByFileName(fileName, raffleBingoStepsDirectory)),
    ...envFileNames.map((fileName) => loadTaskByFileName(fileName, envDirectory)),
  ];
};

export const loadAllLicenseTasks = (): Task[] => {
  const licenseFileNames = fs.readdirSync(licenseDirectory);
  return licenseFileNames.map((fileName) => loadTaskByFileName(fileName, licenseDirectory));
};

export const loadAllRaffleBingoSteps = (): Task[] => {
  const licenseFileNames = fs.readdirSync(licenseDirectory);
  return licenseFileNames.map((fileName) => loadTaskByFileName(fileName, licenseDirectory));
};

export const loadAllMunicipalTasks = (): Task[] => {
  const municipalFileNames = fs.readdirSync(municipalDirectory);
  return municipalFileNames.map((fileName) => loadTaskByFileName(fileName, municipalDirectory));
};

export const loadAllEnvTasks = (): Task[] => {
  const envFileNames = fs.readdirSync(envDirectory);
  return envFileNames.map((fileName) => loadTaskByFileName(fileName, envDirectory));
};

export const loadAllTasksOnly = (): Task[] => {
  const taskFileNames = fs.readdirSync(tasksDirectory);
  return taskFileNames.map((fileName) => loadTaskByFileName(fileName, tasksDirectory));
};

export const loadTaskByUrlSlug = (urlSlug: string): Task => {
  try {
    const fileAsTask = getFileNameByUrlSlug(tasksDirectory, urlSlug);
    return loadTaskByFileName(fileAsTask, tasksDirectory);
  } catch {
    try {
      const fileAsLicense = getFileNameByUrlSlug(licenseDirectory, urlSlug);
      return loadTaskByFileName(fileAsLicense, licenseDirectory);
    } catch {
      try {
        const fileAsMunicipal = getFileNameByUrlSlug(municipalDirectory, urlSlug);
        return loadTaskByFileName(fileAsMunicipal, municipalDirectory);
      } catch {
        try {
          const fileAsRaffleBingo = getFileNameByUrlSlug(raffleBingoStepsDirectory, urlSlug);
          return loadTaskByFileName(fileAsRaffleBingo, raffleBingoStepsDirectory);
        } catch {
          const fileAsEnv = getFileNameByUrlSlug(envDirectory, urlSlug);
          return loadTaskByFileName(fileAsEnv, envDirectory);
        }
      }
    }
  }
};

export const loadTaskByFileName = (fileName: string, directory: string): Task => {
  const fullPath = path.join(directory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const dependencies = JSON.parse(fs.readFileSync(path.join(roadmapsDir, "task-dependencies.json"), "utf8"))
    .dependencies as TaskDependencies[];

  const taskWithoutLinks = convertTaskMd(fileContents);
  const fileNameWithoutMd = fileName.split(".md")[0];

  const currentTaskDependencies = dependencies.find((dependency) => {
    return dependency.task === fileNameWithoutMd || dependency.licenseTask === fileNameWithoutMd;
  });
  const taskDependencies = currentTaskDependencies?.taskDependencies || [];
  const licenseTaskDependencies = currentTaskDependencies?.licenseTaskDependencies || [];
  const combinedDependencies = [...taskDependencies, ...licenseTaskDependencies];
  const unlockedByTaskLinks = combinedDependencies.map((dependencyFileName) => {
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
    try {
      fileContents = fs.readFileSync(path.join(licenseDirectory, `${fileName}.md`), "utf8");
    } catch {
      try {
        fileContents = fs.readFileSync(path.join(municipalDirectory, `${fileName}.md`), "utf8");
      } catch {
        try {
          fileContents = fs.readFileSync(path.join(raffleBingoStepsDirectory, `${fileName}.md`), "utf8");
        } catch {
          fileContents = fs.readFileSync(path.join(envDirectory, `${fileName}.md`), "utf8");
        }
      }
    }
  }

  const taskWithoutLinks = convertTaskMd(fileContents) as TaskWithoutLinks;

  return {
    name: taskWithoutLinks.name,
    urlSlug: taskWithoutLinks.urlSlug,
    filename: fileName,
    id: taskWithoutLinks.id,
  };
};
