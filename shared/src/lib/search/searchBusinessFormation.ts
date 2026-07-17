import { TaskWithoutLinks } from "../../types";
import { convertFileDataToMatchList } from "../search/helpers";
import { FileData, Match } from "./typesForSearch";

export const searchBusinessFormation = (tasks: TaskWithoutLinks[], term: string): Match[] => {
  const businessFormationData = getBusinessFormationData(tasks);

  return convertFileDataToMatchList(businessFormationData, term);
};

export const getBusinessFormationData = (tasks: TaskWithoutLinks[]): FileData[] => {
  const BusinessFormationData: FileData[] = [];

  for (const task of tasks) {
    const name = task.name.toLowerCase();
    const description = task.summaryDescriptionMd.toLowerCase();
    const contentMd = task.contentMd?.toLowerCase() ?? "";
    const callToActionText = task.callToActionText?.toLowerCase() ?? "";
    const labelledTexts = [
      { content: name, label: "Name" },
      { content: description, label: "Summary" },
      { content: contentMd, label: "Content" },
      { content: callToActionText, label: "CTA Text" },
    ];

    BusinessFormationData.push({
      fileName: task.id,
      labelledTexts,
      blockTexts: [],
      listTexts: [],
    });
  }

  return BusinessFormationData;
};
