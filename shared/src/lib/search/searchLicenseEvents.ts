import { LicenseEventType } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchLicenseEvents = (licenseEvents: LicenseEventType[], term: string): Match[] => {
  const licenseEventData = getLicenseEventData(licenseEvents);

  return convertFileDataToMatchList(licenseEventData, term);
};

export const getLicenseEventData = (licenseEvents: LicenseEventType[]): FileData[] => {
  const licenseEventData: FileData[] = [];

  for (const item of licenseEvents) {
    const content = item.contentMd.toLowerCase();
    const filename = item.filename.toLowerCase();
    const callToActionLink = item.callToActionLink?.toLowerCase();
    const callToActionText = item.callToActionText?.toLowerCase();
    const urlSlug = item.urlSlug.toLowerCase();
    const summaryDescriptionMd = item.summaryDescriptionMd?.toLowerCase();

    const blockTexts = [content];

    const labelledTexts = [
      { content: filename, label: "Filename" },
      { content: callToActionLink, label: "CTA Link" },
      { content: callToActionText, label: "CTA Text" },
      { content: urlSlug, label: "Url Slug" },
      { content: summaryDescriptionMd, label: "Summary Description MD" },
    ];

    licenseEventData.push({
      fileName: item.filename,
      labelledTexts,
      blockTexts,
      listTexts: [], // No listTexts needed for license events
    });
  }

  return licenseEventData;
};
