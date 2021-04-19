import { Task } from "./types/types";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";
import path from "path";
import fs from "fs";

export const getTaskById = async (id: string): Promise<Task> => {
  const roadmapsDir = path.join(process.cwd(), "roadmaps");
  const fullPath = path.join(roadmapsDir, "tasks", `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return convertTaskMdToTask(fileContents);
};

const convertTaskMdToTask = async (taskMdContents: string): Promise<Task> => {
  const matterResult = matter(taskMdContents);
  const taskGrayMatter = matterResult.data as TaskGrayMatter;

  const processedContent = await remark().use(html).process(matterResult.content);

  return {
    contentHtml: processedContent.toString(),
    ...taskGrayMatter,
  };
};

type TaskGrayMatter = {
  id: string;
  name: string;
  destinationText: string;
  callToActionLink: string;
  callToActionText: string;
};
