import {
  Certification,
  County,
  Filing,
  Funding,
  FundingBusinessStage,
  FundingHomeBased,
  FundingpreferenceForOpportunityZone,
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
  readonly id: string;
  readonly name: string;
  readonly urlSlug: string;
  readonly callToActionLink: string;
  readonly callToActionText: string;
  readonly postOnboardingQuestion: string;
  readonly required?: boolean;
  readonly issuingAgency?: string;
  readonly formName?: string;
};

type FundingGrayMatter = {
  readonly id: string;
  readonly name: string;
  readonly urlSlug: string;
  readonly callToActionLink: string;
  readonly callToActionText: string;
  readonly fundingType: FundingType;
  readonly agency: readonly OpportunityAgency[];
  readonly publishStageArchive: FundingPublishStatus | null;
  readonly openDate: string;
  readonly dueDate: string;
  readonly status: FundingStatus;
  readonly programFrequency: FundingProgramFrequency;
  readonly businessStage: FundingBusinessStage;
  readonly employeesRequired: string;
  readonly homeBased: FundingHomeBased;
  readonly mwvb: string;
  readonly preferenceForOpportunityZone: FundingpreferenceForOpportunityZone | null;
  readonly county: readonly County[];
  readonly sector: readonly string[];
};

type CertificationGrayMatter = {
  readonly id: string;
  readonly name: string;
  readonly urlSlug: string;
  readonly callToActionLink: string;
  readonly callToActionText: string;
  readonly agency: readonly OpportunityAgency[];
  readonly applicableOwnershipTypes: readonly string[];
  readonly isSbe: boolean;
};

export type MarkdownResult = {
  readonly content: string;
  readonly grayMatter: unknown;
};

export type TaskWithoutLinks = {
  readonly id: string;
  readonly name: string;
  readonly urlSlug: string;
  readonly callToActionLink: string;
  readonly callToActionText: string;
  readonly postOnboardingQuestion: string;
  readonly contentMd: string;
  readonly required?: boolean;
  readonly issuingAgency?: string;
  readonly formName?: string;
};
