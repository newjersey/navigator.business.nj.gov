import { LicenseEventType } from "../../types";
import { Match, MatchFunction } from "./typesForSearch";

export const searchLicenseEvents = (
  matchFunction: MatchFunction,
  licenseEvents: LicenseEventType[],
  term: string,
): Match[] => {
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
    const summaryDescriptionMd = item.summaryDescriptionMd?.toLowerCase();

    const blockTexts = [content];

    const labelledTexts = [
      { content: filename, label: "Filename" },
      { content: callToActionLink, label: "CTA Link" },
      { content: callToActionText, label: "CTA Text" },
      { content: urlSlug, label: "Url Slug" },
      { content: summaryDescriptionMd, label: "Summary Description MD" },
    ];

    match = matchFunction(blockTexts, term, match);
    match = matchFunction(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
