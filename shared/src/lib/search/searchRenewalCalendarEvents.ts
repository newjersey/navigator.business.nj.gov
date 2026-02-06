import { XrayRenewalCalendarEventType } from "@businessnjgovnavigator/shared/types";
import { convertFileDataToMatchList } from "@businessnjgovnavigator/shared/lib/search/helpers";
import { FileData, Match } from "@businessnjgovnavigator/shared/lib/search/typesForSearch";

export const searchXrayRenewalCalendarEvent = (
  renewalCalendarEvent: XrayRenewalCalendarEventType,
  term: string,
): Match[] => {
  const eventDatas = getXrayRenewalCalendarEventData(renewalCalendarEvent);

  return convertFileDataToMatchList(eventDatas, term);
};

export const getXrayRenewalCalendarEventData = (
  renewalCalendarEvent: XrayRenewalCalendarEventType,
): FileData[] => {
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

  return [
    {
      fileName: renewalCalendarEvent.filename,
      labelledTexts,
      blockTexts,
      listTexts: [], // No listTexts needed for this event type
    },
  ];
};
