import { Task } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export const fetchTaskByFilename = async (filename: string): Promise<Task> => {
  let file;
  if (process.env.NODE_ENV === "test") {
    file = await import(`@/lib/roadmap/fixtures/tasks/${filename}.md`);
  } else {
    file = await import(`@/roadmaps/tasks/${filename}.md`);
  }

  return convertTaskMd(file.default);
};
