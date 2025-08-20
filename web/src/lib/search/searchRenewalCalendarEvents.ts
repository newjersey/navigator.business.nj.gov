import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { XrayRenewalCalendarEventType } from "@businessnjgovnavigator/shared/types";

export const searchXrayRenewalCalendarEvent = (
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

  const blockTexts = [content];

  const labelledTexts = [
    { content: filename, label: "Filename" },
    { content: callToActionLink, label: "CTA Link" },
    { content: callToActionText, label: "CTA Text" },
    { content: urlSlug, label: "Url Slug" },
    { content: eventDisplayName, label: "Event Display Name" },
    { content: name, label: "Name" },
  ];

  match = findMatchInBlock(blockTexts, term, match);
  match = findMatchInLabelledText(labelledTexts, term, match);

  if (match.snippets.length > 0) {
    matches.push(match);
  }

  return matches;
};
