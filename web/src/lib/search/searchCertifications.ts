import { findMatchInBlock, findMatchInLabelledText, findMatchInListText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { Certification } from "@/lib/types/types";

export const searchCertifications = (certifications: Certification[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const cert of certifications) {
    let match: Match = {
      filename: cert.filename,
      snippets: [],
    };

    const content = cert.contentMd.toLowerCase();
    const name = cert.name.toLowerCase();
    const description = cert.descriptionMd.toLowerCase();
    const cta = cert.callToActionText?.toLowerCase();
    const agencies = cert.agency ? cert.agency.map((it) => it.toLowerCase()) : [];

    const blockTexts = [content, description];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: name, label: "Name" },
    ];

    const listTexts = [{ content: agencies, label: "Agency" }];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);
    match = findMatchInListText(listTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
