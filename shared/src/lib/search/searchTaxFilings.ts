import { Filing } from "@businessnjgovnavigator/shared/types";
import { convertFileDataToMatchList } from "@businessnjgovnavigator/shared/lib/search/helpers";
import { FileData, Match } from "@businessnjgovnavigator/shared/lib/search/typesForSearch";

export const searchTaxFilings = (filings: Filing[], term: string): Match[] => {
  const filingData = getFilingData(filings);

  return convertFileDataToMatchList(filingData, term);
};

export const getFilingData = (filings: Filing[]): FileData[] => {
  const filingData: FileData[] = [];

  for (const filing of filings) {
    const content = filing.contentMd.toLowerCase();
    const summary = filing.summaryDescriptionMd?.toLowerCase();
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
    const filename = filing.filename.toLowerCase();
    const urlSlug = filing.urlSlug.toLowerCase();

    const blockTexts = [summary, content];
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
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
    ];

    filingData.push({
      fileName: filing.filename,
      labelledTexts,
      blockTexts,
      listTexts: [], // No listTexts needed for tax filings
    });
  }

  return filingData;
};
