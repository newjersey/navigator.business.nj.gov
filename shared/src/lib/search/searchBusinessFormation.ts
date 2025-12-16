import { TaskWithoutLinks } from "../../types";
import { findMatchInLabelledText } from "../search/helpers";
import { FileData, Match } from "./typesForSearch";

export const searchBusinessFormation = (tasks: TaskWithoutLinks[], term: string): Match[] => {
  const matches: Match[] = [];

  const BusinessFormationDatas = getBusinessFormationData(tasks);

  for (const task of BusinessFormationDatas) {
    let match: Match = {
      filename: task.fileName,
      snippets: [],
    };

    match = findMatchInLabelledText(task.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
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
