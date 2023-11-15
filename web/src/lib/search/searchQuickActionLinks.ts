import { findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { QuickActionLink } from "@/lib/types/types";

export const searchQuickActionLinks = (quickActionTasks: QuickActionLink[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const quickAction of quickActionTasks) {
    let match: Match = {
      filename: quickAction.filename,
      snippets: [],
    };

    const name = quickAction.name.toLowerCase();
    const externalRoute = quickAction.externalRoute?.toLowerCase();
    const filename = quickAction.filename.toLowerCase();

    const labelledTexts = [
      { content: externalRoute, label: "External Link" },
      { content: name, label: "Name/Title" },
      { content: filename, label: "Filename" },
    ];

    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
