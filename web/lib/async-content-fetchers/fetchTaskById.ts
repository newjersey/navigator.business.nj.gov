import { Task } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export const fetchTaskById = async (id: string): Promise<Task> => {
  const file = await import(`../../roadmaps/tasks/${id}.md`);
  return convertTaskMd(file.default);
};
