import { findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { AnytimeActionLink } from "@/lib/types/types";

export const searchAnytimeActionLinks = (anytimeActionTasks: AnytimeActionLink[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const anytimeAction of anytimeActionTasks) {
    let match: Match = {
      filename: anytimeAction.filename,
      snippets: [],
    };

    const name = anytimeAction.name.toLowerCase();
    const externalRoute = anytimeAction.externalRoute?.toLowerCase();
    const filename = anytimeAction.filename.toLowerCase();

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
