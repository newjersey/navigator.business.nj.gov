import { Industry } from "../../industry";
import { Match, MatchFunction } from "./typesForSearch";

export const searchIndustries = (
  matchFunction: MatchFunction,
  industries: Industry[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  for (const industry of industries) {
    let match: Match = {
      filename: industry.id,
      snippets: [],
    };

    const name = industry.name.toLowerCase();
    const description = industry.description.toLowerCase();

    const blockTexts = [description];
    const labelledTexts = [{ content: name, label: "Name" }];

    match = matchFunction(blockTexts, term, match);
    match = matchFunction(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
