import type { TaskProgress } from "@businessnjgovnavigator/shared";
import { useUserData } from "@/lib/data-hooks/useUserData";

export const useUpdateTaskProgress = (): {
  queueUpdateTaskProgress: (taskId: string, newValue: TaskProgress) => void;
} => {
  const { updateQueue } = useUserData();

  const queueUpdateTaskProgress = (taskId: string, newValue: TaskProgress): void => {
    if (!updateQueue) {
      return;
    }
    updateQueue.queueTaskProgress({ [taskId]: newValue });
  };

  return {
    queueUpdateTaskProgress,
  };
};
