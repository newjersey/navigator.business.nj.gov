import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { WebflowLicense } from "@/lib/types/types";

export const searchWebflowLicenses = (licenses: WebflowLicense[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const license of licenses) {
    let match: Match = {
      filename: license.filename,
      snippets: [],
    };

    const content = license.contentMd.toLowerCase();
    const name = license.name.toLowerCase();
    const cta = license.callToActionText?.toLowerCase();
    const agency = license.issuingAgency?.toLowerCase();
    const division = license.issuingDivision?.toLowerCase();
    const classification = license.licenseCertificationClassification?.toLowerCase();
    const industry = license.industryId?.toLowerCase();

    const blockTexts = [content];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: name, label: "Task name" },
      { content: agency, label: "Agency" },
      { content: division, label: "Division" },
      { content: classification, label: "Classification" },
      { content: industry, label: "Industry" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
