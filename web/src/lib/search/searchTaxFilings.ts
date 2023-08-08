import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { Filing } from "@/lib/types/types";

export const searchTaxFilings = (filings: Filing[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const filing of filings) {
    let match: Match = {
      filename: filing.filename,
      snippets: [],
    };

    const content = filing.contentMd.toLowerCase();
    const details = filing.filingDetails?.toLowerCase();
    const rates = filing.taxRates?.toLowerCase();
    const name = filing.name.toLowerCase();
    const cta = filing.callToActionText?.toLowerCase();
    const ctaLink = filing.callToActionLink?.toLowerCase();
    const agency = filing.agency?.toLowerCase();
    const method = filing.filingMethod?.toLowerCase();
    const id = filing.id?.toLowerCase();
    const info = filing.additionalInfo?.toLowerCase();
    const frequency = filing.frequency?.toLowerCase();

    const blockTexts = [content];
    if (details) {
      blockTexts.push(details);
    }
    if (rates) {
      blockTexts.push(rates);
    }
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Task name" },
      { content: agency, label: "Agency" },
      { content: method, label: "Filing Method" },
      { content: id, label: "ID" },
      { content: info, label: "Additional Info" },
      { content: frequency, label: "Frequency" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
