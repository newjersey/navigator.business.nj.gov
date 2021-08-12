import { Task } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export const fetchTaskByFilename = async (filename: string): Promise<Task> => {
  const file = await import(`../../roadmaps/tasks/${filename}.md`);
  return convertTaskMd(file.default);
};
