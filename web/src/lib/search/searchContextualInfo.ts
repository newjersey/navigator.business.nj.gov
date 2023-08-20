import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { ContextualInfoFile } from "@/lib/types/types";

export const searchContextualInfo = (contextualInfo: ContextualInfoFile[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const info of contextualInfo) {
    let match: Match = {
      filename: info.filename,
      snippets: [],
    };

    const content = info.markdown.toLowerCase();
    const filename = info.filename.toLowerCase();
    const header = info.header.toLowerCase();

    const blockTexts = [content];

    const labelledTexts = [
      { content: filename, label: "Filename" },
      { content: header, label: "Header" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
