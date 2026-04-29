import { RecentItem } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchRecents = (recents: RecentItem[], term: string): Match[] => {
  return convertFileDataToMatchList(getRecentData(recents), term);
};

export const getRecentData = (recents: RecentItem[]): FileData[] => {
  const recentData: FileData[] = [];

  for (const recent of recents) {
    const name = recent.name.toLowerCase();
    const slug = recent.slug.toLowerCase();
    const topics = recent.topics?.toLowerCase();
    const agency = recent.agency?.toLowerCase();

    const blockTexts = [recent.body?.toLowerCase(), recent.source?.toLowerCase() ?? ""];

    const labelledTexts = [
      { content: name, label: "Name" },
      { content: slug, label: "Slug" },
      { content: topics, label: "Topics" },
      { content: agency, label: "Agency" },
      { content: recent["cta-text"]?.toLowerCase(), label: "CTA Text" },
    ];

    recentData.push({
      fileName: recent.slug,
      labelledTexts,
      blockTexts,
      listTexts: [],
    });
  }

  return recentData;
};
