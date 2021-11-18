import { getMarkdown } from "@/lib/utils/markdownReader";

export const fetchContextualInfo = async (id: string): Promise<string> => {
  const fileContent = await import(
    `@businessnjgovnavigator/content/display-content/contextual-information/${id}.md`
  );
  return getMarkdown(fileContent.default).content;
};
