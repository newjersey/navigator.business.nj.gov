import { AnytimeActionTask } from "@/lib/types/types";
import { convertAnytimeActionTaskMd } from "@/lib/utils/markdownReader";

export const fetchAnytimeActionByFilename = async (id: string): Promise<AnytimeActionTask> => {
  try {
    const fileContent = await import(`@businessnjgovnavigator/content/anytime-action-tasks/${id}.md`);
    return convertAnytimeActionTaskMd(fileContent.default, id);
  } catch {
    return {
      callToActionLink: undefined,
      callToActionText: undefined,
      issuingAgency: undefined,
      name: "",
      icon: "",
      filename: "",
      urlSlug: "",
      contentMd: "Content Not Found",
      summaryDescriptionMd: "Summary Not Found",
      industryIds: [],
      sectorIds: [],
      applyToAllUsers: false,
    };
  }
};
