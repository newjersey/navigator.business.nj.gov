import { KeysOfType, Roadmap, Task } from "@/lib/types/types";

export const getTaskFromRoadmap = (roadmap: Roadmap | undefined, taskId: string): Task | undefined => {
  return roadmap?.tasks.find((task) => {
    return task.id === taskId;
  });
};

export const getModifiedTaskContent = (
  roadmap: Roadmap | undefined,
  task: Task,
  field: KeysOfType<Task, string>,
): string => {
  const taskInRoadmap = getTaskFromRoadmap(roadmap, task.id);
  if (taskInRoadmap && taskInRoadmap[field] !== task[field]) {
    return taskInRoadmap[field] || "";
  }
  return task[field] || "";
};

export const getModifiedTaskBooleanUndefined = (
  roadmap: Roadmap | undefined,
  task: Task,
  field: KeysOfType<Task, boolean | undefined>,
): boolean | undefined => {
  const taskInRoadmap = getTaskFromRoadmap(roadmap, task.id);
  if (taskInRoadmap && taskInRoadmap[field] !== task[field]) {
    return taskInRoadmap[field] || undefined;
  }
  return task[field] || undefined;
};

export const getUrlSlugs = (roadmap: Roadmap | undefined): string[] => {
  if (!roadmap) {
    return [];
  }
  return roadmap.tasks.map((task) => {
    return task.urlSlug;
  });
};
