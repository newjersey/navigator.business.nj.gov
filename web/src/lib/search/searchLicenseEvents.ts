import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { LicenseEvent } from "@/lib/types/types";

export const searchLicenseEvents = (licenseEvents: LicenseEvent[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const item of licenseEvents) {
    let match: Match = {
      filename: item.filename,
      snippets: [],
    };
    const content = item.contentMd.toLowerCase();
    const filename = item.filename.toLowerCase();
    const callToActionLink = item.callToActionLink?.toLowerCase();
    const callToActionText = item.callToActionText?.toLowerCase();
    const urlSlug = item.urlSlug.toLowerCase();

    const blockTexts = [content];

    const labelledTexts = [
      { content: filename, label: "Filename" },
      { content: callToActionLink, label: "CTA Link" },
      { content: callToActionText, label: "CTA Text" },
      { content: urlSlug, label: "Url Slug" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
