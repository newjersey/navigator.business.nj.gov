import { Step } from "../../types";
import { findMatchInLabelledText } from "./helpers";
import { Match } from "./typesForSearch";

export const searchSteps = (
  steps: Step[],
  term: string,
  parameters: { filename: string; displayTitle: string },
): Match[] => {
  const matches: Match[] = [];

  for (const step of steps) {
    let match: Match = {
      filename: parameters.filename,
      snippets: [],
      displayTitle: parameters.displayTitle,
    };

    const name = step.name.toLowerCase();
    const description = step.description.toLowerCase();

    const labelledTexts = [
      { content: description, label: "Description" },
      { content: name, label: "Name" },
    ];

    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      match.displayTitle = `${match.displayTitle} (Step ${step.stepNumber})`;
      matches.push(match);
    }
  }

  return matches;
};
