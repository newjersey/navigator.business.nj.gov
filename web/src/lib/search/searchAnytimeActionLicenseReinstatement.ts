import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { AnytimeActionLicenseReinstatement } from "@/lib/types/types";

export const searchAnytimeActionLicenseReinstatements = (
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[],
  term: string
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
    const form = anytimeActionLicenseReinstatement.form?.toLowerCase();

    const blockTexts = [summary, content];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Name/Title" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
      { content: form, label: "Form" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
