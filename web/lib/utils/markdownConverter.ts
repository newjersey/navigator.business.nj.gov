import { FieldDisplayContent, Task } from "../types/types";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";

export const convertTaskMd = async (taskMdContents: string): Promise<Task> => {
  const matterResult = matter(taskMdContents);
  const taskGrayMatter = matterResult.data as TaskGrayMatter;

  const processedContent = await remark().use(html).process(matterResult.content);

  return {
    contentHtml: processedContent.toString(),
    ...taskGrayMatter,
  };
};

export const convertFieldDisplayContentMd = async (fieldMdContents: string): Promise<FieldDisplayContent> => {
  const matterResult = matter(fieldMdContents);
  const grayMatter = matterResult.data as FieldDisplayGrayMatter;

  const processedContent = await remark().use(html).process(matterResult.content);

  return {
    contentHtml: processedContent.toString(),
    ...grayMatter,
  };
};

type TaskGrayMatter = {
  id: string;
  name: string;
  destinationText: string;
  callToActionLink: string;
  callToActionText: string;
};

type FieldDisplayGrayMatter = {
  placeholder?: string;
};
