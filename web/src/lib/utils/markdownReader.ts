import { ContextualInfo } from "@/contexts/contextualInfoContext";
import {
  Certification,
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
  MarkdownResult,
  OpportunityAgency,
  TaskWithoutLinks,
  TaxAgency,
  TaxFilingMethod,
  WebflowLicense,
} from "@/lib/types/types";
import matter from "gray-matter";

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
    descriptionMd: oppGrayMatter.descriptionMd ?? "",
  };
};

export const convertCertificationMd = (mdContents: string, filename: string): Certification => {
  const matterResult = matter(mdContents);
  const grayMatter = matterResult.data as CertificationGrayMatter;

  return {
    contentMd: matterResult.content,
    filename: filename,
    ...grayMatter,
    descriptionMd: grayMatter.descriptionMd ?? "",
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
};

type TaskGrayMatter = {
  id: string;
  webflowId?: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  postOnboardingQuestion: string;
  issuingAgency?: string;
  issuingDivision?: string;
  divisionPhone?: string;
  formName?: string;
  requiresLocation?: boolean;
  industryId?: string;
  licenseCertificationClassification?: string;
};

type FundingGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  fundingType: FundingType;
  agency: OpportunityAgency[];
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
  descriptionMd: string;
};

type CertificationGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  agency: OpportunityAgency[];
  applicableOwnershipTypes: string[];
  isSbe: boolean;
  descriptionMd: string;
};

type WebflowLicenseGrayMatter = {
  id: string;
  webflowId: string;
  urlSlug: string;
  name: string;
  callToActionLink: string;
  callToActionText: string;
  issuingAgency?: string;
  issuingDivision: string;
  divisionPhone: string;
  licenseCertificationClassification: string;
  industryId?: string;
};
