import { AnytimeActionTask } from "../../types";
import { findMatchInBlock, findMatchInLabelledText } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchAnytimeActionTasks = (
  anytimeActionTasks: AnytimeActionTask[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  const AnytimeActionDatas: FileData[] = getAnytimeActionTasksData(anytimeActionTasks);

  for (const anytimeActionData of AnytimeActionDatas) {
    let match: Match = {
      filename: anytimeActionData.fileName,
      snippets: [],
    };

    match = findMatchInBlock(anytimeActionData.blockTexts, term, match);
    match = findMatchInLabelledText(anytimeActionData.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
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
