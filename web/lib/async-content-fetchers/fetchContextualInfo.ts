import { getMarkdownContent } from "../utils/markdownReader";

export const fetchContextualInfo = async (id: string): Promise<string> => {
  const fileContent = await import(`../../display-content/contextual-information/${id}.md`);
  return getMarkdownContent(fileContent.default);
};
