import { AnytimeActionTask } from "@/lib/types/types";
import { convertAnytimeActionTaskMd } from "@/lib/utils/markdownReader";

export const fetchAnytimeActionByFilename = async (id: string): Promise<AnytimeActionTask> => {
  // This is bad and should 100% be refactored to not exist and is as a high priority refactor
  try {
    const fileContent = await import(`@businessnjgovnavigator/content/anytime-action-tasks-admin/${id}.md`);
    return convertAnytimeActionTaskMd(fileContent.default, id);
  } catch {
    try {
      const fileContent = await import(
        `@businessnjgovnavigator/content/anytime-action-tasks-licenses/${id}.md`
      );
      return convertAnytimeActionTaskMd(fileContent.default, id);
    } catch {
      try {
        const fileContent = await import(
          `@businessnjgovnavigator/content/anytime-action-tasks-reinstatements/${id}.md`
        );
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
    }
  }
};
