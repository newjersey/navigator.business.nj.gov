import { ContextualInfo } from "@/contexts/contextualInfoContext";
import { convertContextualInfoMd } from "@/lib/utils/markdownReader";

export const fetchContextualInfo = async (id: string): Promise<ContextualInfo> => {
  try {
    const fileContent = await import(
      `@businessnjgovnavigator/content/display-content/contextual-information/${id}.md`
    );
    return convertContextualInfoMd(fileContent.default);
  } catch {
    return {
      isVisible: false,
      header: "Content Not Found",
      markdown: ""
    };
  }
};
