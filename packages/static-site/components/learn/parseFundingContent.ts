export interface FundingContentSections {
  readonly eligibility: string;
  readonly benefits: string;
}

export const parseFundingContent = (contentMd: string): FundingContentSections => {
  const eligibilityMarker = "## Eligibility";
  const calloutMarker = ":::largeCallout";
  const calloutEnd = ":::";

  const eligibilityStart = contentMd.indexOf(eligibilityMarker);
  const calloutStart = contentMd.indexOf(calloutMarker);

  if (eligibilityStart === -1 || calloutStart === -1) {
    return { eligibility: "", benefits: "" };
  }

  const stripContextualInfoIds = (text: string): string => text.replace(/`([^`|]+)\|[^`]+`/g, "$1");

  const eligibility = stripContextualInfoIds(
    contentMd.slice(eligibilityStart + eligibilityMarker.length, calloutStart).trim(),
  );

  const benefitsBodyStart = contentMd.indexOf("\n", calloutStart) + 1;
  const calloutEndIndex = contentMd.indexOf(calloutEnd, calloutStart + calloutMarker.length);
  const benefits =
    calloutEndIndex === -1
      ? ""
      : stripContextualInfoIds(contentMd.slice(benefitsBodyStart, calloutEndIndex).trim());

  return { eligibility, benefits };
};
