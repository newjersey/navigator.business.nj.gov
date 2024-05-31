import { ContextualInfo } from "@/contexts/contextualInfoContext";
import {
  Certification,
  County,
  Filing,
  Funding,
  FundingBusinessStage,
  FundingCertifications,
  FundingHomeBased,
  FundingProgramFrequency,
  FundingPublishStatus,
  FundingStatus,
  FundingType,
  FundingpreferenceForOpportunityZone,
  LicenseEvent,
  MarkdownResult,
  PageMetadata,
  PostOnboardingFile,
  QuickActionLicenseReinstatement,
  QuickActionLink,
  QuickActionTask,
  TaskWithoutLinks,
  TaxAgency,
  TaxFilingMethod,
  ViolationNotice,
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

export const convertPostOnboardingMd = (contentMdContents: string, filename: string): PostOnboardingFile => {
  const matterResult = matter(contentMdContents);
  const grayMatter = matterResult.data as PostOnboardingGrayMatter;
  return {
    question: grayMatter.radioQuestion,
    contentMd: matterResult.content,
    radioYes: grayMatter.radioYes,
    radioNo: grayMatter.radioNo,
    radioNoContent: grayMatter.radioNoContent,
    callToActionYesText1: grayMatter.callToActionYesText1,
    callToActionYesLink1: grayMatter.callToActionYesLink1,
    callToActionYesText2: grayMatter.callToActionYesText2,
    callToActionYesLink2: grayMatter.callToActionYesLink2,
    callToActionYesDropdownText: grayMatter.callToActionYesDropdownText,
    filename,
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

export const convertViolationMd = (violationMdContents: string): ViolationNotice => {
  const matterResult = matter(violationMdContents);
  const violationGrayMatter = matterResult.data as ViolationGrayMatter;

  return {
    contentMd: matterResult.content,
    ...violationGrayMatter,
  };
};

export const convertLicenseMd = (taskMdContents: string, filename: string): LicenseEvent => {
  const matterResult = matter(taskMdContents);
  const taskGrayMatter = matterResult.data as LicenseGrayMatter;
  return {
    contentMd: matterResult.content,
    filename,
    ...taskGrayMatter,
  };
};

export const convertQuickActionTaskMd = (
  quickActionTaskMdContents: string,
  filename: string
): QuickActionTask => {
  const matterResult = matter(quickActionTaskMdContents);
  const quickActionGrayMatter = matterResult.data as QuickActionTaskGrayMatter;
  return {
    contentMd: matterResult.content,
    filename,
    ...quickActionGrayMatter,
  };
};

export const convertQuickActionLicenseReinstatementMd = (
  quickActionLicenseReinstatementMdContents: string,
  filename: string
): QuickActionLicenseReinstatement => {
  const matterResult = matter(quickActionLicenseReinstatementMdContents);
  const quickActionGrayMatter = matterResult.data as QuickActionTaskGrayMatter;
  return {
    contentMd: matterResult.content,
    filename,
    ...quickActionGrayMatter,
  };
};

export const convertQuickActionLinkMd = (
  quickActionLinkMdContents: string,
  filename: string
): QuickActionLink => {
  const matterResult = matter(quickActionLinkMdContents);
  const quickActionGrayMatter = matterResult.data as QuickActionLinkGrayMatter;
  return {
    filename,
    ...quickActionGrayMatter,
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

export const convertPageMetadataMd = (pageMetadataMdContents: string, filename: string): PageMetadata => {
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
  id: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
};

type QuickActionLinkGrayMatter = {
  name: string;
  icon: string;
  externalRoute: string;
  industryIds: string[];
  sectorIds: string[];
  applyToAllUsers: boolean;
};

type QuickActionTaskGrayMatter = {
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  form: string;
  icon: string;
  industryIds: string[];
  sectorIds: string[];
  applyToAllUsers: boolean;
  summaryDescriptionMd: string;
};

type TaskGrayMatter = {
  id: string;
  webflowId?: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  postOnboardingQuestion: string;
  agencyId?: string;
  agencyAdditionalContext?: string;
  divisionPhone?: string;
  formName?: string;
  requiresLocation?: boolean;
  industryId?: string;
  licenseCertificationClassification?: string;
  summaryDescriptionMd: string;
};

type ViolationGrayMatter = {
  id: string;
  webflowId?: string;
  name: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  summaryDescriptionMd: string;
  agencyId?: string;
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

type PostOnboardingGrayMatter = {
  radioQuestion: string;
  radioYes: string;
  radioNo: string;
  radioNoContent: string;
  callToActionYesText1: string;
  callToActionYesLink1: string;
  callToActionYesText2: string;
  callToActionYesLink2: string;
  callToActionYesDropdownText: string;
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
