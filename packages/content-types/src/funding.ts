import type { County } from "./county";

/** The category of funding mechanism. */
export type FundingType =
  | "tax credit"
  | "loan"
  | "grant"
  | "technical assistance"
  | "hiring and employee training support"
  | "tax exemption";

/** Indicates a funding should not be publicly visible. */
export type FundingPublishStatus = "Do Not Publish";

/** The current application acceptance status of a funding opportunity. */
export type FundingStatus =
  | "rolling application"
  | "deadline"
  | "first come, first serve"
  | "closed"
  | "opening soon";

/** How often the funding program accepts applications. */
export type FundingProgramFrequency =
  | "annual"
  | "ongoing"
  | "recurring"
  | "one-time"
  | "pilot"
  | "other";

/** The business maturity stage targeted by the funding. */
export type FundingBusinessStage = "early-stage" | "operating" | "both";

/** Whether home-based businesses are eligible. */
export type FundingHomeBased = "yes" | "no" | "unknown";

/** Whether the funding prefers businesses in opportunity zones. */
export type FundingPreferenceForOpportunityZone = "yes" | "no";

/** Certification types that may qualify a business for funding. */
export type FundingCertifications =
  | "woman-owned"
  | "minority-owned"
  | "veteran-owned"
  | "disabled-veteran"
  | "small-business-enterprise"
  | "disadvantaged-business-enterprise"
  | "emerging-small-business-enterprise";

/** A funding opportunity available to New Jersey businesses. */
export type Funding = {
  /** Unique identifier for the funding. */
  readonly id: string;
  /** Source markdown filename without extension. */
  readonly filename: string;
  /** Display name of the funding program. */
  readonly name: string;
  /** URL-friendly slug for routing. */
  readonly urlSlug: string;
  /** External link for the primary call-to-action. */
  readonly callToActionLink: string;
  /** Label text for the primary call-to-action. */
  readonly callToActionText: string;
  /** Short description shown on sidebar cards. */
  readonly sidebarCardBodyText: string;
  /** Markdown summary description. */
  readonly summaryDescriptionMd: string;
  /** Full markdown content body. */
  readonly contentMd: string;
  /** Category of funding mechanism. */
  readonly fundingType: FundingType;
  /** Administering agency or agencies. */
  readonly agency: string[] | null | undefined;
  /** Archive status indicating the funding should not be published. */
  readonly publishStageArchive: FundingPublishStatus | null;
  /** Application open date (YYYY-MM-DD). */
  readonly openDate: string;
  /** Application due date (YYYY-MM-DD). */
  readonly dueDate: string;
  /** Current application acceptance status. */
  readonly status: FundingStatus;
  /** How often the program accepts applications. */
  readonly programFrequency: FundingProgramFrequency;
  /** Target business maturity stage. */
  readonly businessStage: FundingBusinessStage;
  /** Employee count requirement description. */
  readonly employeesRequired: string;
  /** Whether home-based businesses are eligible. */
  readonly homeBased: FundingHomeBased;
  /** Certifications that qualify a business. */
  readonly certifications: FundingCertifications[] | null;
  /** Whether opportunity zone businesses are preferred. */
  readonly preferenceForOpportunityZone: FundingPreferenceForOpportunityZone | null;
  /** Eligible counties. */
  readonly county: County[];
  /** Eligible industry sectors. */
  readonly sector: string[];
  /** Description of the program's purpose. */
  readonly programPurpose: string | null | undefined;
  /** Agency contact information. */
  readonly agencyContact: string | null | undefined;
  /** Whether the funding is restricted to nonprofits. */
  readonly isNonprofitOnly: boolean | undefined | null;
  /** Minimum number of employees required. */
  readonly minEmployeesRequired: number | undefined;
  /** Maximum number of employees allowed. */
  readonly maxEmployeesRequired: number | undefined;
  /** Whether this funding is a priority/featured opportunity. */
  readonly priority: boolean | undefined;
};
