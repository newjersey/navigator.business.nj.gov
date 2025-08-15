import { convertContextualInfoMd } from "@businessnjgovnavigator/shared";
import { ContextualInfo } from "@businessnjgovnavigator/shared/types";

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
      markdown: "",
    };
  }
};
