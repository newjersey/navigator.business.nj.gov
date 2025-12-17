import { LookupFundingAgencyById } from "../../fundingAgency";
import { Certification } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchCertifications = (certifications: Certification[], term: string): Match[] => {
  const certificationData = getCertificationData(certifications);

  return convertFileDataToMatchList(certificationData, term);
};

export const getCertificationData = (certifications: Certification[]): FileData[] => {
  const certificationData: FileData[] = [];

  for (const cert of certifications) {
    const content = cert.contentMd.toLowerCase();
    const name = cert.name.toLowerCase();
    const sidebarCardBodyText = cert.sidebarCardBodyText.toLowerCase();
    const summary = cert.summaryDescriptionMd?.toLowerCase();
    const cta = cert.callToActionText?.toLowerCase();
    const ctaLink = cert.callToActionLink?.toLowerCase();
    const agencyIDs = cert.agency ? cert.agency.map((it) => it.toLowerCase()) : [];
    const agencyNames = cert.agency
      ? cert.agency.map((it) => LookupFundingAgencyById(it).name.toLowerCase())
      : [];
    const filename = cert.filename.toLowerCase();
    const urlSlug = cert.urlSlug.toLowerCase();

    const blockTexts = [summary, content, sidebarCardBodyText];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Name" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
    ];

    const listTexts = [
      { content: agencyIDs, label: "Agency ID" },
      { content: agencyNames, label: "Agency Names" },
    ];

    certificationData.push({
      fileName: cert.filename,
      labelledTexts,
      blockTexts,
      listTexts,
    });
  }

  return certificationData;
};
