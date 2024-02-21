import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { QuickActionLicenseReinstatement } from "@/lib/types/types";

export const searchQuickActionLicenseReinstatements = (
  quickActionLicenseReinstatements: QuickActionLicenseReinstatement[],
  term: string
): Match[] => {
  const matches: Match[] = [];

  for (const quickActionLicenseReinstatement of quickActionLicenseReinstatements) {
    let match: Match = {
      filename: quickActionLicenseReinstatement.filename,
      snippets: [],
    };

    const content = quickActionLicenseReinstatement.contentMd.toLowerCase();
    const summary = quickActionLicenseReinstatement.summaryDescriptionMd?.toLowerCase();
    const name = quickActionLicenseReinstatement.name.toLowerCase();
    const cta = quickActionLicenseReinstatement.callToActionText?.toLowerCase();
    const ctaLink = quickActionLicenseReinstatement.callToActionLink?.toLowerCase();
    const filename = quickActionLicenseReinstatement.filename.toLowerCase();
    const urlSlug = quickActionLicenseReinstatement.urlSlug.toLowerCase();
    const form = quickActionLicenseReinstatement.form?.toLowerCase();

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
