import fs from "fs";
import path from "path";
import { Task } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export type PathParams<P> = { params: P; locale?: string };
export type TaskIdParam = {
  taskId: string;
};

const roadmapsDir = path.join(process.cwd(), "roadmaps");

export const loadAllTaskIds = (): PathParams<TaskIdParam>[] => {
  const fileNames = fs.readdirSync(path.join(roadmapsDir, "tasks"));

  return fileNames.map((fileName) => {
    return {
      params: {
        taskId: fileName.replace(/\.md$/, ""),
      },
    };
  });
};

export const loadTaskById = async (id: string): Promise<Task> => {
  const roadmapsDir = path.join(process.cwd(), "roadmaps");
  const fullPath = path.join(roadmapsDir, "tasks", `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return convertTaskMd(fileContents);
};
