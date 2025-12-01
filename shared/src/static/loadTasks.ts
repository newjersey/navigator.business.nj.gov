import fs from "fs";
import path from "path";
import { convertTaskMd } from "../markdownReader";
import { Task, TaskDependencies, TaskLink, TaskWithoutLinks } from "../types/types";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParameters<P> = { params: P; locale?: string };
export type TaskUrlSlugParameter = {
  taskUrlSlug: string;
};

const getRoadmapsDirectory = (isTest: boolean = false): string => {
  if (isTest) {
    return path.join(process.cwd(), "content", "src", "roadmaps");
  }
  return path.join(process.cwd(), "..", "content", "src", "roadmaps");
};

const getTasksDirectory = (isTest: boolean = false): string =>
  path.join(getRoadmapsDirectory(isTest), "tasks");
const getLicenseDirectory = (isTest: boolean = false): string =>
  path.join(getRoadmapsDirectory(isTest), "license-tasks");
const getMunicipalDirectory = (isTest: boolean = false): string =>
  path.join(getRoadmapsDirectory(isTest), "municipal-tasks");
const getRaffleBingoStepsDirectory = (isTest: boolean = false): string =>
  path.join(getRoadmapsDirectory(isTest), "raffle-bingo-steps");
const getEnvironmentDirectory = (isTest: boolean = false): string =>
  path.join(getRoadmapsDirectory(isTest), "env-tasks");

export const loadAllTaskUrlSlugs = (): PathParameters<TaskUrlSlugParameter>[] => {
  const taskFileNames = fs.readdirSync(getTasksDirectory());
  const licenseFileNames = fs.readdirSync(getLicenseDirectory());
  const municipalFileNames = fs.readdirSync(getMunicipalDirectory());
  const raffleBingoFileNames = fs.readdirSync(getRaffleBingoStepsDirectory());
  const environmentFileNames = fs.readdirSync(getEnvironmentDirectory());

  return [
    ...taskFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, getTasksDirectory()),
      },
    })),
    ...licenseFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, getLicenseDirectory()),
      },
    })),
    ...municipalFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, getMunicipalDirectory()),
      },
    })),
    ...raffleBingoFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, getRaffleBingoStepsDirectory()),
      },
    })),
    ...environmentFileNames.map((fileName) => ({
      params: {
        taskUrlSlug: loadUrlSlugByFilename(fileName, getEnvironmentDirectory()),
      },
    })),
  ];
};

export const loadAllTasks = (isTest: boolean = false): Task[] => {
  const taskFileNames = fs.readdirSync(getTasksDirectory(isTest));
  const licenseFileNames = fs.readdirSync(getLicenseDirectory(isTest));
  const municipalFileNames = fs.readdirSync(getMunicipalDirectory(isTest));
  const raffleBingoFileNames = fs.readdirSync(getRaffleBingoStepsDirectory(isTest));
  const environmentFileNames = fs.readdirSync(getEnvironmentDirectory(isTest));

  return [
    ...taskFileNames.map((fileName) =>
      loadTaskByFileName(fileName, getTasksDirectory(isTest), isTest),
    ),
    ...licenseFileNames.map((fileName) =>
      loadTaskByFileName(fileName, getLicenseDirectory(isTest), isTest),
    ),
    ...municipalFileNames.map((fileName) =>
      loadTaskByFileName(fileName, getMunicipalDirectory(isTest), isTest),
    ),
    ...raffleBingoFileNames.map((fileName) =>
      loadTaskByFileName(fileName, getRaffleBingoStepsDirectory(isTest), isTest),
    ),
    ...environmentFileNames.map((fileName) =>
      loadTaskByFileName(fileName, getEnvironmentDirectory(isTest), isTest),
    ),
  ];
};

export const loadAllLicenseTasks = (): Task[] => {
  const licenseFileNames = fs.readdirSync(getLicenseDirectory());
  return licenseFileNames.map((fileName) => loadTaskByFileName(fileName, getLicenseDirectory()));
};

export const loadAllRaffleBingoSteps = (): Task[] => {
  const licenseFileNames = fs.readdirSync(getLicenseDirectory());
  return licenseFileNames.map((fileName) => loadTaskByFileName(fileName, getLicenseDirectory()));
};

export const loadAllMunicipalTasks = (): Task[] => {
  const municipalFileNames = fs.readdirSync(getMunicipalDirectory());
  return municipalFileNames.map((fileName) =>
    loadTaskByFileName(fileName, getMunicipalDirectory()),
  );
};

export const loadAllEnvironmentTasks = (): Task[] => {
  const environmentFileNames = fs.readdirSync(getEnvironmentDirectory());
  return environmentFileNames.map((fileName) =>
    loadTaskByFileName(fileName, getEnvironmentDirectory()),
  );
};

export const loadAllTasksOnly = (): Task[] => {
  const taskFileNames = fs.readdirSync(getTasksDirectory());
  return taskFileNames.map((fileName) => loadTaskByFileName(fileName, getTasksDirectory()));
};

export const loadTaskByUrlSlug = (urlSlug: string): Task => {
  try {
    const fileAsTask = getFileNameByUrlSlug(getTasksDirectory(), urlSlug);
    return loadTaskByFileName(fileAsTask, getTasksDirectory());
  } catch {
    try {
      const fileAsLicense = getFileNameByUrlSlug(getLicenseDirectory(), urlSlug);
      return loadTaskByFileName(fileAsLicense, getLicenseDirectory());
    } catch {
      try {
        const fileAsMunicipal = getFileNameByUrlSlug(getMunicipalDirectory(), urlSlug);
        return loadTaskByFileName(fileAsMunicipal, getMunicipalDirectory());
      } catch {
        try {
          const fileAsRaffleBingo = getFileNameByUrlSlug(getRaffleBingoStepsDirectory(), urlSlug);
          return loadTaskByFileName(fileAsRaffleBingo, getRaffleBingoStepsDirectory());
        } catch {
          const fileAsEnvironment = getFileNameByUrlSlug(getEnvironmentDirectory(), urlSlug);
          return loadTaskByFileName(fileAsEnvironment, getEnvironmentDirectory());
        }
      }
    }
  }
};

export const loadTaskByFileName = (
  fileName: string,
  directory: string,
  isTest: boolean = false,
): Task => {
  const fullPath = path.join(directory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const dependencies = JSON.parse(
    fs.readFileSync(path.join(getRoadmapsDirectory(isTest), "task-dependencies.json"), "utf8"),
  ).dependencies as TaskDependencies[];

  const taskWithoutLinks = convertTaskMd(fileContents);
  const fileNameWithoutMd = fileName.split(".md")[0];

  const currentTaskDependencies = dependencies.find((dependency) => {
    return dependency.task === fileNameWithoutMd || dependency.licenseTask === fileNameWithoutMd;
  });
  const taskDependencies = currentTaskDependencies?.taskDependencies || [];
  const licenseTaskDependencies = currentTaskDependencies?.licenseTaskDependencies || [];
  const combinedDependencies = [...taskDependencies, ...licenseTaskDependencies];
  const unlockedByTaskLinks = combinedDependencies.map((dependencyFileName) => {
    return loadTaskLinkByFilename(dependencyFileName, isTest);
  });

  return {
    ...taskWithoutLinks,
    unlockedBy: unlockedByTaskLinks,
    filename: fileNameWithoutMd,
  } as Task;
};

const loadTaskLinkByFilename = (fileName: string, isTest: boolean = false): TaskLink => {
  let fileContents;
  try {
    fileContents = fs.readFileSync(path.join(getTasksDirectory(isTest), `${fileName}.md`), "utf8");
  } catch {
    try {
      fileContents = fs.readFileSync(
        path.join(getLicenseDirectory(isTest), `${fileName}.md`),
        "utf8",
      );
    } catch {
      try {
        fileContents = fs.readFileSync(
          path.join(getMunicipalDirectory(isTest), `${fileName}.md`),
          "utf8",
        );
      } catch {
        try {
          fileContents = fs.readFileSync(
            path.join(getRaffleBingoStepsDirectory(isTest), `${fileName}.md`),
            "utf8",
          );
        } catch {
          fileContents = fs.readFileSync(
            path.join(getEnvironmentDirectory(isTest), `${fileName}.md`),
            "utf8",
          );
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
