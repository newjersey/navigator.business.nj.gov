import { Task, TaskDependencies, TaskLink } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export const fetchTaskByFilename = async (filename: string): Promise<Task> => {
  const taskWithoutLinks = convertTaskMd(await fetchTaskFile(filename));

  const dependencies = await fetchDependenciesFile();

  const currentTaskDependencies = dependencies.find((dependency) => {
    return dependency.task === filename || dependency.licenseTask === filename;
  });
  const taskDependencies = currentTaskDependencies?.taskDependencies || [];
  const licenseTaskDependencies = currentTaskDependencies?.licenseTaskDependencies || [];
  const combinedDependencies = [...taskDependencies, ...licenseTaskDependencies];
  const mappedDependencies = combinedDependencies.map(fetchTaskLinkByFilename);

  const unlockedByTaskLinks = await Promise.all(mappedDependencies);

  return {
    ...taskWithoutLinks,
    unlockedBy: unlockedByTaskLinks,
    filename: filename,
  };
};

export const fetchTaskLinkByFilename = async (filename: string): Promise<TaskLink> => {
  const taskWithoutLinks = convertTaskMd(await fetchTaskFile(filename));
  return {
    name: taskWithoutLinks.name,
    urlSlug: taskWithoutLinks.urlSlug,
    filename: filename,
    id: taskWithoutLinks.id,
  };
};

const fetchDependenciesFile = async (): Promise<TaskDependencies[]> => {
  const file = await (process.env.NODE_ENV === "test"
    ? import(`@/lib/roadmap/fixtures/task-dependencies.json`)
    : import(`@businessnjgovnavigator/content/roadmaps/task-dependencies.json`));
  return file.default.dependencies;
};

const fetchTaskFile = async (filename: string): Promise<string> => {
  let file;

  if (process.env.NODE_ENV === "test") {
    file = await import(`@/lib/roadmap/fixtures/tasks/${filename}.md`);
  } else {
    try {
      file = await import(`@businessnjgovnavigator/content/roadmaps/tasks/${filename}.md`);
    } catch {
      try {
        file = await import(`@businessnjgovnavigator/content/roadmaps/license-tasks/${filename}.md`);
      } catch {
        try {
          file = await import(`@businessnjgovnavigator/content/roadmaps/municipal-tasks/${filename}.md`);
        } catch {
          try {
            file = await import(`@businessnjgovnavigator/content/roadmaps/raffle-bingo-steps/${filename}.md`);
          } catch {
            file = await import(`@businessnjgovnavigator/content/roadmaps/env-tasks/${filename}.md`);
          }
        }
      }
    }
  }
  return file.default;
};
