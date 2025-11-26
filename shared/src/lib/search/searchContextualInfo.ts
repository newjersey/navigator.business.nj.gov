import { ContextualInfoFile } from "../../types";
import { findMatchInBlock, findMatchInLabelledText } from "./helpers";
import { Match } from "./typesForSearch";

export const searchContextualInfo = (
  contextualInfo: ContextualInfoFile[],
  term: string,
): Match[] => {
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
