import { Industry } from "../../industry";
import { findMatchInBlock, findMatchInLabelledText } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchIndustries = (industries: Industry[], term: string): Match[] => {
  const matches: Match[] = [];

  const industryData = getIndustryData(industries);

  for (const industryDataItem of industryData) {
    let match: Match = {
      filename: industryDataItem.fileName,
      snippets: [],
    };

    match = findMatchInBlock(industryDataItem.blockTexts, term, match);
    match = findMatchInLabelledText(industryDataItem.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};

export const getIndustryData = (industries: Industry[]): FileData[] => {
  const industryData: FileData[] = [];

  for (const industry of industries) {
    const name = industry.name.toLowerCase();
    const description = industry.description.toLowerCase();

    const blockTexts = [description];
    const labelledTexts = [{ content: name, label: "Name" }];

    industryData.push({
      fileName: industry.id,
      labelledTexts,
      blockTexts,
      listTexts: [], // No listTexts needed for industries
    });
  }

  return industryData;
};
