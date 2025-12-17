import { LookupFundingAgencyById } from "../../fundingAgency";
import { Funding } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchFundings = (fundings: Funding[], term: string): Match[] => {
  const fundingData = getFundingData(fundings);

  return convertFileDataToMatchList(fundingData, term);
};

export const getFundingData = (fundings: Funding[]): FileData[] => {
  const fundingData: FileData[] = [];

  for (const funding of fundings) {
    const content = funding.contentMd.toLowerCase();
    const name = funding.name.toLowerCase();
    const sidebarCardBodyText = funding.sidebarCardBodyText.toLowerCase();
    const summary = funding.summaryDescriptionMd.toLowerCase();
    const cta = funding.callToActionText?.toLowerCase();
    const ctaLink = funding.callToActionLink?.toLowerCase();
    const agencyIDs = funding.agency ? funding.agency.map((it) => it.toLowerCase()) : [];
    const agencyNames = funding.agency
      ? funding.agency.map((it) => LookupFundingAgencyById(it).name.toLowerCase())
      : [];
    const fundingType = funding.fundingType.toLowerCase();
    const status = funding.status.toLowerCase();
    const frequency = funding.programFrequency.toLowerCase();
    const stage = funding.businessStage.toLowerCase();
    const certs = funding.certifications
      ? funding.certifications.map((it) => it.toLowerCase())
      : [];
    const counties = funding.county ? funding.county.map((it) => it.toLowerCase()) : [];
    const purpose = funding.programPurpose?.toLowerCase();
    const contact = funding.agencyContact?.toLowerCase();
    const sectors = funding.sector ? funding.sector.map((it) => it.toLowerCase()) : [];
    const filename = funding.filename.toLowerCase();
    const urlSlug = funding.urlSlug.toLowerCase();

    const blockTexts = [summary, content, sidebarCardBodyText];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Name" },
      { content: fundingType, label: "Funding Type" },
      { content: status, label: "Status" },
      { content: frequency, label: "Program Frequency" },
      { content: stage, label: "Stage" },
      { content: purpose, label: "Program Purpose" },
      { content: contact, label: "Agency Contact" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
    ];

    const listTexts = [
      { content: agencyIDs, label: "Agency ID" },
      { content: agencyNames, label: "Agency Names" },
      { content: certs, label: "Certification" },
      { content: counties, label: "County" },
      { content: sectors, label: "Sector" },
    ];

    fundingData.push({
      fileName: funding.filename,
      labelledTexts,
      blockTexts,
      listTexts,
    });
  }

  return fundingData;
};
