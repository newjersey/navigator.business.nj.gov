import {
  Certification,
  County,
  Filing,
  Funding,
  FundingBusinessStage,
  FundingHomeBased,
  FundingPreferenceGiven,
  FundingProgramFrequency,
  FundingPublishStatus,
  FundingStatus,
  FundingType,
  OpportunityAgency,
} from "@/lib/types/types";
import matter from "gray-matter";

export const convertTaskMd = (taskMdContents: string): TaskWithoutLinks | Filing => {
  const matterResult = matter(taskMdContents);
  const taskGrayMatter = matterResult.data as TaskGrayMatter;

  return {
    contentMd: matterResult.content,
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
  };
};

export const convertCertificationMd = (mdContents: string, filename: string): Certification => {
  const matterResult = matter(mdContents);
  const grayMatter = matterResult.data as CertificationGrayMatter;

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

type TaskGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  postOnboardingQuestion: string;
  required?: boolean;
  issuingAgency?: string;
  formName?: string;
};

type FundingGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  benefits: string;
  eligibility: string;
  fundingType: FundingType;
  agency: OpportunityAgency[];
  publishStageArchive: FundingPublishStatus | null;
  openDate: string;
  dueDate: string;
  status: FundingStatus;
  programFrequency: FundingProgramFrequency;
  businessStage: FundingBusinessStage;
  businessSize: string;
  homeBased: FundingHomeBased;
  mwvb: string;
  preferenceGiven: FundingPreferenceGiven | null;
  county: County[];
  sector: string[];
};

type CertificationGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  agency: OpportunityAgency[];
  applicableOwnershipTypes: string[];
};

export type MarkdownResult = {
  content: string;
  grayMatter: unknown;
};

export type TaskWithoutLinks = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  postOnboardingQuestion: string;
  contentMd: string;
  required?: boolean;
  issuingAgency?: string;
  formName?: string;
};
