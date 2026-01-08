import { SidebarCardContent } from "@businessnjgovnavigator/shared/types";
import { convertFileDataToMatchList } from "@businessnjgovnavigator/shared/lib/search/helpers";
import { FileData, Match } from "@businessnjgovnavigator/shared/lib/search/typesForSearch";

export const searchSidebarCards = (sidebarCards: SidebarCardContent[], term: string): Match[] => {
  const sidebarCardData = getSidebarCardData(sidebarCards);

  return convertFileDataToMatchList(sidebarCardData, term);
};

export const getSidebarCardData = (sidebarCards: SidebarCardContent[]): FileData[] => {
  const sidebarCardData: FileData[] = [];

  for (const card of sidebarCards) {
    const content = card.contentMd.toLowerCase();
    const id = card.id.toLowerCase();
    const header = card.header?.toLowerCase();
    const notStartedHeader = card.notStartedHeader?.toLowerCase();
    const completedHeader = card.completedHeader?.toLowerCase();
    const ctaText = card.ctaText?.toLowerCase();

    const blockTexts = [content];

    const labelledTexts = [
      { content: id, label: "Filename" },
      { content: header, label: "Header" },
      { content: notStartedHeader, label: "Not Started Header" },
      { content: completedHeader, label: "Completed Header" },
      { content: ctaText, label: "CTA Text" },
    ];

    sidebarCardData.push({
      fileName: card.id,
      labelledTexts,
      blockTexts,
      listTexts: [], // No listTexts needed for sidebar cards
    });
  }

  return sidebarCardData;
};
