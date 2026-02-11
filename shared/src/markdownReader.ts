import matter from "gray-matter";
import { LicenseName } from "@businessnjgovnavigator/shared/license";
import {
  Certification,
  ContextualInfo,
  County,
  Filing,
  Funding,
  FundingBusinessStage,
  FundingCertifications,
  FundingHomeBased,
  FundingpreferenceForOpportunityZone,
  FundingProgramFrequency,
  FundingPublishStatus,
  FundingStatus,
  FundingType,
  LicenseEventType,
  MarkdownResult,
  PageMetadata,
  TaskWithoutLinks,
  TaxAgency,
  TaxFilingMethod,
  WebflowLicense,
  XrayRenewalCalendarEventType,
} from "@businessnjgovnavigator/shared/types/types";

export const convertContextualInfoMd = (contentMdContents: string): ContextualInfo => {
  const matterResult = matter(contentMdContents);
  const contentGrayMatter = matterResult.data as ContextualInfoGrayMatter;

  return {
    isVisible: false,
    markdown: matterResult.content,
    ...contentGrayMatter,
  };
};

export const convertTaskMd = (taskMdContents: string): TaskWithoutLinks => {
  const matterResult = matter(taskMdContents);
  const taskGrayMatter = matterResult.data as TaskGrayMatter;

  return {
    contentMd: matterResult.content,
    ...taskGrayMatter,
  };
};

export const convertLicenseCalendarEventMd = (
  licenseMdContents: string,
  filename: string,
): LicenseEventType => {
  const matterResult = matter(licenseMdContents);

  const licenseGrayMatter = matterResult.data as LicenseGrayMatter;
  delete licenseGrayMatter.notesMd;

  const licenseName = licenseGrayMatter.licenseName as LicenseName;
  return {
    contentMd: matterResult.content,
    filename,
    ...licenseGrayMatter,
    licenseName,
  };
};

export const convertXrayRenewalCalendarEventMd = (
  renewalMdContents: string,
  filename: string,
): XrayRenewalCalendarEventType => {
  const matterResult = matter(renewalMdContents);

  const renewalGrayMatter = matterResult.data as XrayRenewalGrayMatter;
  delete renewalGrayMatter.notesMd;

  return {
    contentMd: matterResult.content,
    filename,
    ...renewalGrayMatter,
  };
};

export const convertFilingMd = (taskMdContents: string, filename: string): Filing => {
  const matterResult = matter(taskMdContents);
  const taskGrayMatter = matterResult.data as FilingGrayMatter;
  return {
    contentMd: matterResult.content,
    filename,
    ...taskGrayMatter,
  };
};

export const convertFundingMd = (oppMdContents: string, filename: string): Funding => {
  const matterResult = matter(oppMdContents);
  const oppGrayMatter = matterResult.data as FundingGrayMatter;

  return {
    contentMd: matterResult.content,
    filename: filename,
    ...oppGrayMatter,
    sidebarCardBodyText: oppGrayMatter.sidebarCardBodyText ?? "",
  };
};

export const convertCertificationMd = (mdContents: string, filename: string): Certification => {
  const matterResult = matter(mdContents);
  const grayMatter = matterResult.data as CertificationGrayMatter;

  return {
    contentMd: matterResult.content,
    filename: filename,
    ...grayMatter,
    sidebarCardBodyText: grayMatter.sidebarCardBodyText ?? "",
  };
};

export const convertWebflowLicenseMd = (mdContents: string, filename: string): WebflowLicense => {
  const matterResult = matter(mdContents);
  const grayMatter = matterResult.data as WebflowLicenseGrayMatter;

  return {
    contentMd: matterResult.content,
    filename: filename,
    ...grayMatter,
  };
};

export const convertPageMetadataMd = (
  pageMetadataMdContents: string,
  filename: string,
): PageMetadata => {
  const matterResult = matter(pageMetadataMdContents);
  const pageMetadataGrayMatter = matterResult.data as PageMetadataGrayMatter;
  return {
    filename: filename,
    ...pageMetadataGrayMatter,
  };
};

export const getMarkdown = (mdContents: string): MarkdownResult => {
  const matterResult = matter(mdContents);

  return {
    content: matterResult.content,
    grayMatter: matterResult.data,
  };
};

type ContextualInfoGrayMatter = {
  header: string;
};

type FilingGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  additionalInfo: string;
  frequency: string;
  extension: boolean;
  taxRates: string;
  treasuryLink: string;
  filingMethod: TaxFilingMethod | null;
  filingDetails: string;
  agency: TaxAgency | null;
  summaryDescriptionMd: string;
};

type LicenseGrayMatter = {
  issuingAgency: string;
  disclaimerText: string;
  renewalEventDisplayName: string;
  expirationEventDisplayName: string;
  urlSlug: string;
  callToActionLink?: string;
  callToActionText?: string;
  summaryDescriptionMd: string;
  notesMd?: string;
  licenseName: string;
};

type XrayRenewalGrayMatter = {
  id: string;
  issuingAgency: string;
  name: string;
  eventDisplayName: string;
  urlSlug: string;
  callToActionLink?: string;
  callToActionText?: string;
  summaryDescriptionMd: string;
  notesMd?: string;
};

type TaskGrayMatter = {
  id: string;
  webflowId?: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  agencyId?: string;
  agencyAdditionalContext?: string;
  divisionPhone?: string;
  formName?: string;
  requiresLocation?: boolean;
  industryId?: string;
  licenseCertificationClassification?: string;
  summaryDescriptionMd: string;
};

type FundingGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  fundingType: FundingType;
  agency: string[] | null;
  publishStageArchive: FundingPublishStatus | null;
  openDate: string;
  dueDate: string;
  status: FundingStatus;
  programFrequency: FundingProgramFrequency;
  businessStage: FundingBusinessStage;
  employeesRequired: string;
  homeBased: FundingHomeBased;
  certifications: FundingCertifications[] | null;
  preferenceForOpportunityZone: FundingpreferenceForOpportunityZone | null;
  county: County[];
  sector: string[];
  programPurpose: string;
  agencyContact: string;
  sidebarCardBodyText: string;
  isNonprofitOnly: boolean | undefined | null;
  summaryDescriptionMd: string;
  priority: boolean | undefined;
  minEmployeesRequired: number | undefined;
  maxEmployeesRequired: number | undefined;
};

type CertificationGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  agency: string[] | null;
  applicableOwnershipTypes: string[];
  isSbe: boolean;
  sidebarCardBodyText: string;
  summaryDescriptionMd: string;
};

type WebflowLicenseGrayMatter = {
  id: string;
  webflowId: string;
  urlSlug: string;
  name: string;
  callToActionLink: string;
  callToActionText: string;
  agencyId?: string;
  agencyAdditionalContext?: string;
  divisionPhone: string;
  licenseCertificationClassification: string;
  industryId?: string;
  summaryDescriptionMd: string;
};

type PageMetadataGrayMatter = {
  titlePostfix: string;
  siteDescription: string;
  homeTitle: string;
  dashboardTitle: string;
  profileTitle: string;
  deadLinksTitle: string;
  deadUrlsTitle: string;
  featureFlagsTitle: string;
};
