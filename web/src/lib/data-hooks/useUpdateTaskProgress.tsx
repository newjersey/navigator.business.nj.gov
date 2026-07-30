import { useUserData } from "@/lib/data-hooks/useUserData";
import { TaskProgress } from "@businessnjgovnavigator/shared";

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
