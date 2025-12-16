import { LookupTaskAgencyById } from "../../taskAgency";
import { WebflowLicense } from "../../types";
import { findMatchInBlock, findMatchInLabelledText } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchWebflowLicenses = (licenses: WebflowLicense[], term: string): Match[] => {
  const matches: Match[] = [];

  const licenseData = getWebflowLicenseData(licenses);

  for (const licenseDataItem of licenseData) {
    let match: Match = {
      filename: licenseDataItem.fileName,
      snippets: [],
    };

    match = findMatchInBlock(licenseDataItem.blockTexts, term, match);
    match = findMatchInLabelledText(licenseDataItem.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};

export const getWebflowLicenseData = (licenses: WebflowLicense[]): FileData[] => {
  const licenseData: FileData[] = [];

  for (const license of licenses) {
    const content = license.contentMd?.toLowerCase() ?? "";
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

    licenseData.push({
      fileName: license.filename,
      labelledTexts,
      blockTexts,
      listTexts: [], // No listTexts needed for webflow licenses
    });
  }

  return licenseData;
};
