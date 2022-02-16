import { getMarkdown } from "@/lib/utils/markdownReader";

export const fetchContextualInfo = async (id: string): Promise<string> => {
  try {
    const fileContent = await import(
      `@businessnjgovnavigator/content/display-content/contextual-information/${id}.md`
    );
    return getMarkdown(fileContent.default).content;
  } catch {
    return "Content Not Found";
  }
};
