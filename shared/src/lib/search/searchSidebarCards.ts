import { SidebarCardContent } from "../../types";
import { findMatchInBlock, findMatchInLabelledText } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchSidebarCards = (sidebarCards: SidebarCardContent[], term: string): Match[] => {
  const matches: Match[] = [];

  const sidebarCardData = getSidebarCardData(sidebarCards);

  for (const cardData of sidebarCardData) {
    let match: Match = {
      filename: cardData.fileName,
      snippets: [],
    };

    match = findMatchInBlock(cardData.blockTexts, term, match);
    match = findMatchInLabelledText(cardData.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
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
