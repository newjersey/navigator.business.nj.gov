import { Task, TaskDependencies, TaskLink } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export const fetchTaskByFilename = async (filename: string): Promise<Task> => {
  const taskWithoutLinks = convertTaskMd(await fetchTaskFile(filename));

  const dependencies = await fetchDependenciesFile();
  const unlockedByTaskLinks = await Promise.all((dependencies[filename] || []).map(fetchTaskLinkByFilename));

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

const fetchDependenciesFile = async (): Promise<TaskDependencies> => {
  let file;
  if (process.env.NODE_ENV === "test") {
    file = await import(`@/lib/roadmap/fixtures/task-dependencies.json`);
  } else {
    file = await import(`@businessnjgovnavigator/content/roadmaps/task-dependencies.json`);
  }
  return file.default;
};

const fetchTaskFile = async (filename: string): Promise<string> => {
  let file;
  if (process.env.NODE_ENV === "test") {
    file = await import(`@/lib/roadmap/fixtures/tasks/${filename}.md`);
  } else {
    file = await import(`@businessnjgovnavigator/content/roadmaps/tasks/${filename}.md`);
  }
  return file.default;
};
