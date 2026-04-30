import { CovidItem } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchCovids = (covids: CovidItem[], term: string): Match[] => {
  return convertFileDataToMatchList(getCovidData(covids), term);
};

export const getCovidData = (covids: CovidItem[]): FileData[] => {
  const covidData: FileData[] = [];

  for (const covid of covids) {
    const name = covid.name.toLowerCase();
    const slug = covid.slug.toLowerCase();
    const topic = covid.topic?.toLowerCase();

    const blockTexts: string[] = [];
    if (covid.source) blockTexts.push(covid.source.toLowerCase());

    const labelledTexts = [
      { content: name, label: "Name" },
      { content: slug, label: "Slug" },
      { content: topic, label: "Topic" },
    ];

    for (let index = 1; index <= 15; index++) {
      const headline = covid[`s${index}-headline`];
      const content = covid[`section-${index}`];
      if (headline)
        labelledTexts.push({ content: headline.toLowerCase(), label: `Headline ${index}` });
      if (content) blockTexts.push(content.toLowerCase());
    }

    covidData.push({
      fileName: covid.slug,
      labelledTexts,
      blockTexts,
      listTexts: [],
    });
  }

  return covidData;
};
