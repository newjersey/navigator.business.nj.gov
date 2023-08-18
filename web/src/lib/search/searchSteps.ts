import { findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { Step } from "@/lib/types/types";

export const searchSteps = (steps: Step[], term: string, params: { filename: string }): Match[] => {
  const matches: Match[] = [];

  for (const step of steps) {
    let match: Match = {
      filename: params.filename,
      snippets: []
    };

    const name = step.name.toLowerCase();
    const description = step.description.toLowerCase();

    const labelledTexts = [
      { content: description, label: "Description" },
      { content: name, label: "Name" }
    ];

    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      match.filename = `${match.filename} (Step ${step.stepNumber})`;
      matches.push(match);
    }
  }

  return matches;
};
