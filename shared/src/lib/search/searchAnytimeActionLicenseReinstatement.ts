import { AnytimeActionLicenseReinstatement } from "../../types";
import { findMatchInBlock, findMatchInLabelledText } from "../search/helpers";
import { FileData, Match } from "./typesForSearch";

export const searchAnytimeActionLicenseReinstatements = (
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  const AnytimeActionDatas: FileData[] = getAnytimeActionLicenseReinstatementsData(
    anytimeActionLicenseReinstatements,
  );

  for (const AnytimeActionData of AnytimeActionDatas) {
    let match: Match = {
      filename: AnytimeActionData.fileName,
      snippets: [],
    };

    match = findMatchInLabelledText(AnytimeActionData.labelledTexts, term, match);
    match = findMatchInBlock(AnytimeActionData.blockTexts, term, match);
    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};

export const getAnytimeActionLicenseReinstatementsData = (
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[],
): FileData[] => {
  const AnytimeActionLicenseReinstatementsData: FileData[] = [];

  for (const anytimeActionLicenseReinstatement of anytimeActionLicenseReinstatements) {
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

    AnytimeActionLicenseReinstatementsData.push({
      fileName: anytimeActionLicenseReinstatement.filename,
      labelledTexts,
      blockTexts,
      listTexts: [],
    });
  }
  return AnytimeActionLicenseReinstatementsData;
};
