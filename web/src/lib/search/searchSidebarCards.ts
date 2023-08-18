import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { SidebarCardContent } from "@/lib/types/types";

export const searchSidebarCards = (sidebarCards: SidebarCardContent[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const card of sidebarCards) {
    let match: Match = {
      filename: card.id,
      snippets: []
    };

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
      { content: ctaText, label: "CTA Text" }
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
