import { QuickActionTask } from "@/lib/types/types";
import { convertQuickActionTaskMd } from "@/lib/utils/markdownReader";

export const fetchQuickActionByFilename = async (id: string): Promise<QuickActionTask> => {
  try {
    const fileContent = await import(`@businessnjgovnavigator/content/quick-action-tasks/${id}.md`);
    return convertQuickActionTaskMd(fileContent.default, id);
  } catch {
    return {
      callToActionLink: undefined,
      callToActionText: undefined,
      form: undefined,
      name: "",
      icon: "",
      filename: "",
      urlSlug: "",
      contentMd: "Content Not Found",
    };
  }
};
