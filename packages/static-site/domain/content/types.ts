export type {
  AnytimeActionCategory,
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  Certification,
  County,
  Filing,
  Funding,
  FundingBusinessStage,
  FundingCertifications,
  FundingHomeBased,
  FundingPreferenceForOpportunityZone,
  FundingProgramFrequency,
  FundingPublishStatus,
  FundingStatus,
  FundingType,
  Industry,
  LicenseEventType,
  RoadmapStep,
  Sector,
  Task,
  TaskLink,
  TaxAgency,
  TaxFilingMethod,
} from "@businessnjgovnavigator/content-types";

/** A static page managed in the CMS with structured heading/text sections. */
export interface PageItem {
  /** Display name of the page. */
  name: string;
  /** URL-friendly slug used for routing and file lookup. */
  slug: string;
  /** Legacy Webflow CMS identifier. */
  webflowId?: string;
  /** If true, make a page for this but do not create a link to it from the "Plan"/"Start" etc main page */
  /** Assumes false if undefined */
  hideFromCategoryPage?: boolean | undefined;
  /** Category this page belongs to (e.g., "plan", "start", "operate"). */
  category?: string;
  /** Introductory text displayed below the page title. */
  "sub-heading-text"?: string;
  /** Tags used to improve site search relevance. */
  "meta-data"?: string;
  /** Label for the page's primary navigation link. */
  "main-link-text"?: string;
  /** Slug of the parent page (used for breadcrumb navigation). */
  "primary-page"?: string;
  /** Dynamic heading and text section fields (heading-N, main-text-N, etc.). */
  [key: string]: string | undefined;
}

/** A recent news or announcement item from the CMS. */
export interface RecentItem {
  /** Display name of the recent item. */
  name: string;
  /** URL-friendly slug used for routing and file lookup. */
  slug: string;
  /** Legacy Webflow CMS identifier. */
  webflowId?: string;
  /** Publication date (YYYY-MM-DD). */
  date?: string;
  /** Topic category (e.g., "Grants and Resources"). */
  topics?: string;
  /** Link to the original source article. */
  source?: string;
  /** Section heading displayed on the detail page. */
  "heading-1"?: string;
  /** Short summary text for list views. */
  summary?: string;
  /** Announcement text displayed on the homepage. */
  "homepage-announcement-text-2"?: string;
  /** Label for the call-to-action button. */
  "cta-text"?: string;
  /** Link destination for the call-to-action button. */
  "cta-link"?: string;
  /** Publishing agency name. */
  agency?: string;
  /** Full markdown article content. */
  body: string;
}

/** A frequently asked question managed in the CMS. */
export interface FaqItem {
  /** The FAQ question title. */
  name: string;
  /** URL-friendly slug used for routing and file lookup. */
  slug: string;
  /** Full markdown answer content. */
  body: string;
  /** Parent category slug (e.g., "plan-a-business"). */
  category?: string;
  /** Sub-category slug for finer grouping. */
  "sub-category"?: string;
  /** Legacy Webflow CMS identifier. */
  webflowId?: string;
}

/** A sub-category used to group FAQs and pages. */
export interface SubCategoryItem {
  /** Display name of the sub-category. */
  name: string;
  /** URL-friendly slug used for routing and file lookup. */
  slug: string;
  /** Legacy Webflow CMS identifier. */
  webflowId?: string;
}

/** A top-level content category used for site navigation and page grouping. */
export interface CategoryItem {
  /** Display name of the category. */
  name: string;
  /** URL-friendly slug used for routing and file lookup. */
  slug: string;
  /** Legacy Webflow CMS identifier. */
  webflowId?: string;
  /** Short name displayed in navigation menus. */
  "nav-name"?: string;
  /** Description shown within category section pages. */
  "description-text"?: string;
  /** Description shown on the topics overview screen. */
  "topic-description"?: string;
  /** Description shown on homepage category tiles. */
  "homepage-description"?: string;
}
