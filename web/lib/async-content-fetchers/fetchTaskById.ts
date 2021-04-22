import { Task } from "../types/types";
import { convertTaskMd } from "../utils/markdownReader";

export const fetchTaskById = async (id: string): Promise<Task> => {
  const file = await import(`../../roadmaps/tasks/${id}.md`);
  return convertTaskMd(file.default);
};
