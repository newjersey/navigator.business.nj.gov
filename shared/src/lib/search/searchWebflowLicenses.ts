import { LookupTaskAgencyById } from "../../taskAgency";
import { WebflowLicense } from "../../types";
import { Match, MatchFunction } from "./typesForSearch";

export const searchWebflowLicenses = (
  matchFunction: MatchFunction,
  licenses: WebflowLicense[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  for (const license of licenses) {
    let match: Match = {
      filename: license.filename,
      snippets: [],
    };

    const content = license.contentMd?.toLowerCase();
    const name = license.webflowName?.toLowerCase();
    const cta = license.callToActionText?.toLowerCase();
    const ctaLink = license.callToActionLink?.toLowerCase();
    const agency = license.agencyId
      ? LookupTaskAgencyById(license.agencyId).name.toLowerCase()
      : "";
    const division = license.agencyAdditionalContext?.toLowerCase();
    const classification = license.licenseCertificationClassification?.toLowerCase();
    const industry = license.webflowIndustry?.toLowerCase();
    const summary = license.summaryDescriptionMd?.toLowerCase();
    const filename = license.filename.toLowerCase();
    const urlSlug = license.urlSlug?.toLowerCase();

    const blockTexts = [content, summary];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Task name" },
      { content: agency, label: "Agency" },
      { content: division, label: "Division" },
      { content: classification, label: "Classification" },
      { content: industry, label: "Industry" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
    ];

    match = matchFunction(blockTexts, term, match);
    match = matchFunction(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
