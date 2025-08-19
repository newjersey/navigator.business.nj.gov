import { findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { TaskWithoutLinks } from "@businessnjgovnavigator/shared/types";

export const searchBusinessFormation = (tasks: TaskWithoutLinks[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const task of tasks) {
    let match: Match = {
      filename: task.id,
      snippets: [],
    };

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

    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
