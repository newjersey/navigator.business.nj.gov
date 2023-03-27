import { Match } from "@/lib/search/typesForSearch";
import { Funding } from "@/lib/types/types";

export const searchFundings = (fundings: Funding[], term: string) => {
  const matches: Match[] = [];

  for (const funding of fundings) {
    const match: Match = {
      filename: funding.filename,
      snippets: [],
    };

    const content = funding.contentMd.toLowerCase();
    const name = funding.name.toLowerCase();
    const description = funding.descriptionMd.toLowerCase();
    const cta = funding.callToActionText?.toLowerCase();
    const agencies = funding.agency ? funding.agency.map((it) => it.toLowerCase()) : [];
    const fundingType = funding.fundingType.toLowerCase();
    const status = funding.status.toLowerCase();
    const frequency = funding.programFrequency.toLowerCase();
    const stage = funding.businessStage.toLowerCase();
    const certs = funding.certifications ? funding.certifications.map((it) => it.toLowerCase()) : [];
    const counties = funding.county ? funding.county.map((it) => it.toLowerCase()) : [];
    const purpose = funding.programPurpose?.toLowerCase();
    const contact = funding.agencyContact.toLowerCase();
    const sectors = funding.sector ? funding.sector.map((it) => it.toLowerCase()) : [];

    const blockTexts = [content, description];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: name, label: "Name" },
      { content: fundingType, label: "Funding Type" },
      { content: status, label: "Status" },
      { content: frequency, label: "Program Frequency" },
      { content: stage, label: "Stage" },
      { content: purpose, label: "Program Purpose" },
      { content: contact, label: "Agency Contact" },
    ];

    const listTexts = [
      { content: agencies, label: "Agency" },
      { content: certs, label: "Certification" },
      { content: counties, label: "County" },
      { content: sectors, label: "Sector" },
    ];

    for (const blockText of blockTexts) {
      if (blockText.includes(term)) {
        const index = blockText.indexOf(term);
        const startIndex = index - 50 < 0 ? 0 : index - 50;
        const endIndex = term.length + index + 50;
        match.snippets.push(blockText.slice(startIndex, endIndex));
      }
    }

    for (const labelledText of labelledTexts) {
      if (labelledText.content?.includes(term)) {
        match.snippets.push(`${labelledText.label}: ${labelledText.content}`);
      }
    }

    for (const listText of listTexts) {
      for (const item of listText.content) {
        if (item?.includes(term)) {
          match.snippets.push(`${listText.label}: ${item}`);
        }
      }
    }

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
