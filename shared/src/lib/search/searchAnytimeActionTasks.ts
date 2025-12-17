import { AnytimeActionTask } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchAnytimeActionTasks = (
  anytimeActionTasks: AnytimeActionTask[],
  term: string,
): Match[] => {
  const AnytimeActionDatas: FileData[] = getAnytimeActionTasksData(anytimeActionTasks);

  return convertFileDataToMatchList(AnytimeActionDatas, term);
};

export const getAnytimeActionTasksData = (anytimeActionTasks: AnytimeActionTask[]): FileData[] => {
  const AnytimeActionTasksData: FileData[] = [];

  for (const anytimeAction of anytimeActionTasks) {
    const content = anytimeAction.contentMd.toLowerCase();
    const summary = anytimeAction.summaryDescriptionMd?.toLowerCase();
    const name = anytimeAction.name.toLowerCase();
    const cta = anytimeAction.callToActionText?.toLowerCase();
    const ctaLink = anytimeAction.callToActionLink?.toLowerCase();
    const filename = anytimeAction.filename.toLowerCase();
    const urlSlug = anytimeAction.urlSlug.toLowerCase();
    const issuingAgency = anytimeAction.issuingAgency?.toLowerCase();

    const blockTexts = [summary, content];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Name/Title" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
      { content: issuingAgency, label: "Issuing Agency" },
    ];

    AnytimeActionTasksData.push({
      fileName: anytimeAction.filename,
      labelledTexts,
      blockTexts,
      listTexts: [],
    });
  }

  return AnytimeActionTasksData;
};
