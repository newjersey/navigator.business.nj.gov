import { TropicalStormIdaItem } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchTropicalStormIda = (items: TropicalStormIdaItem[], term: string): Match[] => {
  return convertFileDataToMatchList(getTropicalStormIdaData(items), term);
};

export const getTropicalStormIdaData = (items: TropicalStormIdaItem[]): FileData[] => {
  return items.map((item) => {
    const blockTexts: string[] = [];
    if (item.source) blockTexts.push(item.source.toLowerCase());
    if (item["section-1"]) blockTexts.push(item["section-1"].toLowerCase());
    if (item["section-2"]) blockTexts.push(item["section-2"].toLowerCase());

    return {
      fileName: item.slug,
      labelledTexts: [
        { content: item.name.toLowerCase(), label: "Name" },
        { content: item.slug.toLowerCase(), label: "Slug" },
        { content: item.topics?.toLowerCase(), label: "Topics" },
        { content: item["s1-heading"]?.toLowerCase(), label: "Heading 1" },
        { content: item["s2-heading"]?.toLowerCase(), label: "Heading 2" },
      ],
      blockTexts,
      listTexts: [],
    };
  });
};
