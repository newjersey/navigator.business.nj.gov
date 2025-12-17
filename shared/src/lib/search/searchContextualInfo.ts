import { ContextualInfoFile } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchContextualInfo = (
  contextualInfo: ContextualInfoFile[],
  term: string,
): Match[] => {
  const contextualInfoData = getContextualInfoData(contextualInfo);

  return convertFileDataToMatchList(contextualInfoData, term);
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
