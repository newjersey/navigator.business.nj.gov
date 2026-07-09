import { stripContextualInfoIds } from "./stripContentDirectives";

export interface FundingContentSections {
  readonly eligibility: string;
  readonly benefits: string;
}

export const parseFundingContent = (contentMd: string): FundingContentSections => {
  const calloutMarker = ":::largeCallout";
  const calloutEnd = ":::";

  const calloutStart = contentMd.indexOf(calloutMarker);

  // Match the first level-2 heading regardless of its text (content files vary
  // between "## Eligibility" and headings like "## Eligible Expenses"). The
  // heading itself is rendered from the message file; we extract only the body
  // beneath it, up to the callout when one is present.
  const headingMatch = contentMd.match(/^##[^\n#][^\n]*$/m);
  const headingStart = headingMatch?.index ?? -1;

  let eligibility = "";
  if (headingStart !== -1) {
    const bodyStart = contentMd.indexOf("\n", headingStart) + 1;
    const bodyEnd = calloutStart === -1 ? contentMd.length : calloutStart;
    eligibility = stripContextualInfoIds(contentMd.slice(bodyStart, bodyEnd).trim());
  }

  let benefits = "";
  if (calloutStart !== -1) {
    const benefitsBodyStart = contentMd.indexOf("\n", calloutStart) + 1;
    const calloutEndIndex = contentMd.indexOf(calloutEnd, calloutStart + calloutMarker.length);
    if (calloutEndIndex !== -1) {
      benefits = stripContextualInfoIds(contentMd.slice(benefitsBodyStart, calloutEndIndex).trim());
    }
  }

  return { eligibility, benefits };
};
