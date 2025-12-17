import { ContextualInfoFile } from "../../types";
import { findMatchInBlock, findMatchInLabelledText } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchContextualInfo = (
  contextualInfo: ContextualInfoFile[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  const contextualInfoData = getContextualInfoData(contextualInfo);

  for (const infoData of contextualInfoData) {
    let match: Match = {
      filename: infoData.fileName,
      snippets: [],
    };

    match = findMatchInBlock(infoData.blockTexts, term, match);
    match = findMatchInLabelledText(infoData.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};

export const getContextualInfoData = (contextualInfo: ContextualInfoFile[]): FileData[] => {
  const contextualInfoData: FileData[] = [];

  for (const info of contextualInfo) {
    const content = info.markdown.toLowerCase();
    const filename = info.filename.toLowerCase();
    const header = info.header.toLowerCase();

    const blockTexts = [content];

    const labelledTexts = [
      { content: filename, label: "Filename" },
      { content: header, label: "Header" },
    ];

    contextualInfoData.push({
      fileName: info.filename,
      labelledTexts,
      blockTexts,
      listTexts: [],
    });
  }

  return contextualInfoData;
};
