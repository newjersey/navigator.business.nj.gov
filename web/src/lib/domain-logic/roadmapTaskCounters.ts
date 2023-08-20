import { Roadmap } from "@/lib/types/types";
import { Business, TaskProgress } from "@businessnjgovnavigator/shared";

export const getTotalTaskCount = (roadmap: Roadmap | undefined): number => {
  if (!roadmap) {
    return 1;
  }
  return roadmap.tasks.length;
};

type TaskCount = { required: number; optional: number; total: number };

export const getCompletedTaskCount = (
  roadmap: Roadmap | undefined,
  business: Business | undefined
): TaskCount => {
  return getTaskCountForStatus({ business, roadmap, complete: true });
};

export const getIncompleteTaskCount = (
  roadmap: Roadmap | undefined,
  business: Business | undefined
): TaskCount => {
  return getTaskCountForStatus({ business, roadmap, complete: false });
};

const getTaskCountForStatus = ({
  business,
  roadmap,
  complete,
}: {
  complete: boolean;
  roadmap: Roadmap | undefined;
  business: Business | undefined;
}): TaskCount => {
  if (!roadmap || !business) {
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
    if (testIfCorrectStatus(business.taskProgress[id])) {
      optionalTaskCountForStatus += 1;
    }
  }

  for (const id of requiredTasksIds) {
    if (testIfCorrectStatus(business.taskProgress[id])) {
      requiredTotalTaskCountForStatus += 1;
    }
  }

  return {
    required: requiredTotalTaskCountForStatus,
    optional: optionalTaskCountForStatus,
    total: requiredTotalTaskCountForStatus + optionalTaskCountForStatus,
  };
};
