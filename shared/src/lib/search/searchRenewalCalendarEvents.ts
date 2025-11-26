import { XrayRenewalCalendarEventType } from "../../types";
import { Match, MatchFunction } from "./typesForSearch";

export const searchXrayRenewalCalendarEvent = (
  matchFunction: MatchFunction,
  renewalCalendarEvent: XrayRenewalCalendarEventType,
  term: string,
): Match[] => {
  const matches: Match[] = [];

  let match: Match = {
    filename: renewalCalendarEvent.filename,
    snippets: [],
  };
  const content = renewalCalendarEvent.contentMd.toLowerCase();
  const filename = renewalCalendarEvent.filename.toLowerCase();
  const callToActionLink = renewalCalendarEvent.callToActionLink?.toLowerCase();
  const callToActionText = renewalCalendarEvent.callToActionText?.toLowerCase();
  const urlSlug = renewalCalendarEvent.urlSlug.toLowerCase();
  const eventDisplayName = renewalCalendarEvent.eventDisplayName.toLowerCase();
  const name = renewalCalendarEvent.name.toLowerCase();
  const summaryDescriptionMd = renewalCalendarEvent.summaryDescriptionMd?.toLowerCase();

  const blockTexts = [content];

  const labelledTexts = [
    { content: filename, label: "Filename" },
    { content: callToActionLink, label: "CTA Link" },
    { content: callToActionText, label: "CTA Text" },
    { content: urlSlug, label: "Url Slug" },
    { content: eventDisplayName, label: "Event Display Name" },
    { content: name, label: "Name" },
    { content: summaryDescriptionMd, label: "Summary Description MD" },
  ];

  match = matchFunction(blockTexts, term, match);
  match = matchFunction(labelledTexts, term, match);

  if (match.snippets.length > 0) {
    matches.push(match);
  }

  return matches;
};
