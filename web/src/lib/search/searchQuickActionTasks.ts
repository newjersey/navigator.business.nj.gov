import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { QuickActionTask } from "@/lib/types/types";

export const searchQuickActionTasks = (quickActionTasks: QuickActionTask[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const quickAction of quickActionTasks) {
    let match: Match = {
      filename: quickAction.filename,
      snippets: [],
    };

    const content = quickAction.contentMd.toLowerCase();
    const summary = quickAction.summaryDescriptionMd?.toLowerCase();
    const name = quickAction.name.toLowerCase();
    const cta = quickAction.callToActionText?.toLowerCase();
    const ctaLink = quickAction.callToActionLink?.toLowerCase();
    const filename = quickAction.filename.toLowerCase();
    const urlSlug = quickAction.urlSlug.toLowerCase();
    const form = quickAction.form?.toLowerCase();

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
