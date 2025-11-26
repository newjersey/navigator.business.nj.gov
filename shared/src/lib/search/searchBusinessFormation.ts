import { TaskWithoutLinks } from "../../types";
import { Match, MatchFunction } from "./typesForSearch";

export const searchBusinessFormation = (
  matchFunction: MatchFunction,
  tasks: TaskWithoutLinks[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  // console.log(tasks);

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

    match = matchFunction(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
