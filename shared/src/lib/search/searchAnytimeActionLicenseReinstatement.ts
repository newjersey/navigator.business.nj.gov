import { AnytimeActionLicenseReinstatement } from "../../types";
import { Match, MatchFunction } from "./typesForSearch";

export const searchAnytimeActionLicenseReinstatements = (
  matchFunction: MatchFunction,
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  for (const anytimeActionLicenseReinstatement of anytimeActionLicenseReinstatements) {
    let match: Match = {
      filename: anytimeActionLicenseReinstatement.filename,
      snippets: [],
    };

    const content = anytimeActionLicenseReinstatement.contentMd.toLowerCase();
    const summary = anytimeActionLicenseReinstatement.summaryDescriptionMd?.toLowerCase();
    const name = anytimeActionLicenseReinstatement.name.toLowerCase();
    const cta = anytimeActionLicenseReinstatement.callToActionText?.toLowerCase();
    const ctaLink = anytimeActionLicenseReinstatement.callToActionLink?.toLowerCase();
    const filename = anytimeActionLicenseReinstatement.filename.toLowerCase();
    const urlSlug = anytimeActionLicenseReinstatement.urlSlug.toLowerCase();
    const issuingAgency = anytimeActionLicenseReinstatement.issuingAgency?.toLowerCase();

    const blockTexts = [summary, content];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Name/Title" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
      { content: issuingAgency, label: "Issuing Agency" },
    ];

    match = matchFunction(labelledTexts, term, match);
    match = matchFunction(blockTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
