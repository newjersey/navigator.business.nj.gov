import {
  findMatchInBlock,
  findMatchInLabelledText,
  findMatchInListText,
} from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { Certification } from "@/lib/types/types";
import { LookupFundingAgencyById } from "@businessnjgovnavigator/shared/fundingAgency";

export const searchCertifications = (
  certifications: Certification[],
  term: string,
  cmsCollectionName: string,
): Match[] => {
  const matches: Match[] = [];

  for (const cert of certifications) {
    let match: Match = {
      filename: cert.filename,
      cmsCollectionName: cmsCollectionName,
      snippets: [],
    };

    const content = cert.contentMd.toLowerCase();
    const name = cert.name.toLowerCase();
    const sidebarCardBodyText = cert.sidebarCardBodyText.toLowerCase();
    const summary = cert.summaryDescriptionMd?.toLowerCase();
    const cta = cert.callToActionText?.toLowerCase();
    const ctaLink = cert.callToActionLink?.toLowerCase();
    const agencyIDs = cert.agency ? cert.agency.map((it) => it.toLowerCase()) : [];
    const agencyNames = cert.agency
      ? cert.agency.map((it) => LookupFundingAgencyById(it).name.toLowerCase())
      : [];
    const filename = cert.filename.toLowerCase();
    const urlSlug = cert.urlSlug.toLowerCase();

    const blockTexts = [summary, content, sidebarCardBodyText];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Name" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
    ];

    const listTexts = [
      { content: agencyIDs, label: "Agency ID" },
      { content: agencyNames, label: "Agency Names" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);
    match = findMatchInListText(listTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
