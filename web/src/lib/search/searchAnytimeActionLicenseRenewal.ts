import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { AnytimeActionLicenseRenewal } from "@/lib/types/types";

export const searchAnytimeActionLicenseRenewals = (
  anytimeActionLicenseRenewals: AnytimeActionLicenseRenewal[],
  term: string
): Match[] => {
  const matches: Match[] = [];

  for (const anytimeActionLicenseRenewal of anytimeActionLicenseRenewals) {
    let match: Match = {
      filename: anytimeActionLicenseRenewal.filename,
      snippets: [],
    };

    const content = anytimeActionLicenseRenewal.contentMd.toLowerCase();
    const summary = anytimeActionLicenseRenewal.summaryDescriptionMd?.toLowerCase();
    const name = anytimeActionLicenseRenewal.name.toLowerCase();
    const cta = anytimeActionLicenseRenewal.callToActionText?.toLowerCase();
    const ctaLink = anytimeActionLicenseRenewal.callToActionLink?.toLowerCase();
    const filename = anytimeActionLicenseRenewal.filename.toLowerCase();
    const urlSlug = anytimeActionLicenseRenewal.urlSlug.toLowerCase();
    const form = anytimeActionLicenseRenewal.form?.toLowerCase();

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
