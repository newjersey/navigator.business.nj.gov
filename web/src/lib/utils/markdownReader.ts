import {
  County,
  Filing,
  Opportunity,
  OpportunityAgency,
  OpportunityBusinessStage,
  OpportunityFundingType,
  OpportunityHomeBased,
  OpportunityPreferenceGiven,
  OpportunityProgramFrequency,
  OpportunityPublishStatus,
  OpportunityStatus,
  OpportunityType,
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

export const convertOpportunityMd = (oppMdContents: string, filename: string): Opportunity => {
  const matterResult = matter(oppMdContents);
  const oppGrayMatter = matterResult.data as OpportunityGrayMatter;

  return {
    contentMd: matterResult.content,
    filename: filename,
    ...oppGrayMatter,
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
};

type OpportunityGrayMatter = {
  id: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  type: OpportunityType;
  benefits: string;
  eligibility: string;
  fundingType: OpportunityFundingType;
  agency: OpportunityAgency[];
  publishStageArchive: OpportunityPublishStatus | null;
  openDate: string;
  dueDate: string;
  status: OpportunityStatus;
  programFrequency: OpportunityProgramFrequency;
  businessStage: OpportunityBusinessStage;
  businessSize: string;
  homeBased: OpportunityHomeBased;
  mwvb: string;
  preferenceGiven: OpportunityPreferenceGiven | null;
  county: County[];
  industry: string[];
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
};
