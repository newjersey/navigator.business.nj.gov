import { Task } from "../types/types";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";

export const convertTaskMdToTask = async (taskMdContents: string): Promise<Task> => {
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
