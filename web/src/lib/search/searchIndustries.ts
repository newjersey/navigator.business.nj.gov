import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { Industry } from "@businessnjgovnavigator/shared/industry";

export const searchIndustries = (industries: Industry[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const industry of industries) {
    let match: Match = {
      filename: industry.id,
      snippets: []
    };

    const name = industry.name.toLowerCase();
    const description = industry.description.toLowerCase();

    const blockTexts = [description];
    const labelledTexts = [{ content: name, label: "Name" }];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
