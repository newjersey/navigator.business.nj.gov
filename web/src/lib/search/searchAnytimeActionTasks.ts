import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { AnytimeActionTask } from "@/lib/types/types";

export const searchAnytimeActionTasks = (anytimeActionTasks: AnytimeActionTask[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const anytimeAction of anytimeActionTasks) {
    let match: Match = {
      filename: anytimeAction.filename,
      snippets: [],
    };

    const content = anytimeAction.contentMd.toLowerCase();
    const summary = anytimeAction.summaryDescriptionMd?.toLowerCase();
    const name = anytimeAction.name.toLowerCase();
    const cta = anytimeAction.callToActionText?.toLowerCase();
    const ctaLink = anytimeAction.callToActionLink?.toLowerCase();
    const filename = anytimeAction.filename.toLowerCase();
    const urlSlug = anytimeAction.urlSlug.toLowerCase();
    const form = anytimeAction.form?.toLowerCase();

    const blockTexts = [summary, content];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Name/Title" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
      { content: form, label: "Form" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
