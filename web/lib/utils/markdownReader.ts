import { Task } from "@/lib/types/types";
import matter from "gray-matter";

export const convertTaskMd = (taskMdContents: string): Task => {
  const matterResult = matter(taskMdContents);
  const taskGrayMatter = matterResult.data as TaskGrayMatter;

  return {
    contentMd: matterResult.content,
    ...taskGrayMatter,
  };
};

export const getMarkdown = (mdContents: string): MarkdownResult => {
  const matterResult = matter(mdContents);

  return {
    content: matterResult.content,
    grayMatter: matterResult.data,
  };
};

type TaskGrayMatter = {
  id: string;
  name: string;
  callToActionLink: string;
  callToActionText: string;
};

type MarkdownResult = {
  content: string;
  grayMatter: unknown;
};
