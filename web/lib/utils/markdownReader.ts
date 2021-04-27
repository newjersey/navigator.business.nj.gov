import { FieldDisplayContent, Task } from "../types/types";
import matter from "gray-matter";

export const convertTaskMd = async (taskMdContents: string): Promise<Task> => {
  const matterResult = matter(taskMdContents);
  const taskGrayMatter = matterResult.data as TaskGrayMatter;

  return {
    contentMd: matterResult.content,
    ...taskGrayMatter,
  };
};

export const convertFieldDisplayContentMd = async (fieldMdContents: string): Promise<FieldDisplayContent> => {
  const matterResult = matter(fieldMdContents);
  const grayMatter = matterResult.data as FieldDisplayGrayMatter;

  return {
    contentMd: matterResult.content,
    ...grayMatter,
  };
};

export const getMarkdownContent = (fileContents: string): string => {
  const matterResult = matter(fileContents);
  return matterResult.content;
};

type TaskGrayMatter = {
  id: string;
  name: string;
  callToActionLink: string;
  callToActionText: string;
};

type FieldDisplayGrayMatter = {
  placeholder?: string;
};
