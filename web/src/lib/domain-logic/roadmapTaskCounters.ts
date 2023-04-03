import { Roadmap } from "@/lib/types/types";
import { TaskProgress, UserData } from "@businessnjgovnavigator/shared";

export const getTotalTaskCount = (roadmap: Roadmap | undefined): number => {
  if (!roadmap) {
    return 1;
  }
  return roadmap.tasks.length;
};

type TaskCount = { required: number; optional: number; total: number };

export const getCompletedTaskCount = (
  roadmap: Roadmap | undefined,
  userData: UserData | undefined
): TaskCount => {
  return getTaskCountForStatus({ userData, roadmap, complete: true });
};

export const getIncompleteTaskCount = (
  roadmap: Roadmap | undefined,
  userData: UserData | undefined
): TaskCount => {
  return getTaskCountForStatus({ userData, roadmap, complete: false });
};

const getTaskCountForStatus = ({
  userData,
  roadmap,
  complete,
}: {
  complete: boolean;
  roadmap: Roadmap | undefined;
  userData: UserData | undefined;
}): TaskCount => {
  if (!roadmap || !userData) {
    return { required: 0, optional: 0, total: 0 };
  }

  let optionalTaskCountForStatus = 0;
  let requiredTotalTaskCountForStatus = 0;
  const optionalTasksIds: string[] = [];
  const requiredTasksIds: string[] = [];
  for (const task of roadmap.tasks) {
    task.required ? requiredTasksIds.push(task.id) : optionalTasksIds.push(task.id);
  }

  const testIfCorrectStatus = (status: TaskProgress): boolean => {
    return complete ? status === "COMPLETED" : status !== "COMPLETED";
  };

  for (const id of optionalTasksIds) {
    if (testIfCorrectStatus(userData.taskProgress[id])) {
      optionalTaskCountForStatus += 1;
    }
  }

  for (const id of requiredTasksIds) {
    if (testIfCorrectStatus(userData.taskProgress[id])) {
      requiredTotalTaskCountForStatus += 1;
    }
  }

  return {
    required: requiredTotalTaskCountForStatus,
    optional: optionalTaskCountForStatus,
    total: requiredTotalTaskCountForStatus + optionalTaskCountForStatus,
  };
};
