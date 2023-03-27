import { Match } from "@/lib/search/typesForSearch";
import { Certification } from "@/lib/types/types";

export const searchCertifications = (certifications: Certification[], term: string) => {
  const matches: Match[] = [];

  for (const cert of certifications) {
    const match: Match = {
      filename: cert.filename,
      snippets: [],
    };

    const content = cert.contentMd.toLowerCase();
    const name = cert.name.toLowerCase();
    const description = cert.descriptionMd.toLowerCase();
    const cta = cert.callToActionText?.toLowerCase();
    const agencies = cert.agency ? cert.agency.map((it) => it.toLowerCase()) : [];

    if (content.includes(term)) {
      const index = content.indexOf(term);
      const startIndex = index - 50 < 0 ? 0 : index - 50;
      const endIndex = term.length + index + 50;
      match.snippets.push(content.slice(startIndex, endIndex));
    }

    if (description.includes(term)) {
      const index = description.indexOf(term);
      const startIndex = index - 50 < 0 ? 0 : index - 50;
      const endIndex = term.length + index + 50;
      match.snippets.push(description.slice(startIndex, endIndex));
    }

    if (cta?.includes(term)) {
      match.snippets.push(`CTA Text: ${cta}`);
    }

    if (name.includes(term)) {
      match.snippets.push(`Name: ${name}`);
    }

    for (const agency of agencies) {
      if (agency?.includes(term)) {
        match.snippets.push(`Agency: ${agency}`);
      }
    }

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
