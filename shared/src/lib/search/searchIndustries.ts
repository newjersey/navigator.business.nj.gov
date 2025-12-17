import { Industry } from "../../industry";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchIndustries = (industries: Industry[], term: string): Match[] => {
  const industryData = getIndustryData(industries);

  return convertFileDataToMatchList(industryData, term);
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
      listTexts: [],
    });
  }

  return industryData;
};
