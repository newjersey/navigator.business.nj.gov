/** How a tax filing can be submitted. */
export type TaxFilingMethod =
  | "online"
  | "paper-or-by-mail-only"
  | "online-required"
  | "online-or-phone";

/** The government agency responsible for the filing. */
export type TaxAgency =
  | "New Jersey Division of Taxation"
  | "Internal Revenue Service (IRS)"
  | "NJ Department of Labor"
  | "New Jersey Division of Revenue and Enterprise Services";

/** A tax filing requirement for New Jersey businesses. */
export interface Filing {
  /** Unique identifier for the filing. */
  readonly id: string;
  /** Source markdown filename without extension. */
  readonly filename: string;
  /** Display name of the filing. */
  readonly name: string;
  /** URL-friendly slug for routing. */
  readonly urlSlug: string;
  /** External link for the primary call-to-action. */
  readonly callToActionLink?: string;
  /** Label text for the primary call-to-action. */
  readonly callToActionText?: string;
  /** Full markdown content body. */
  readonly contentMd: string;
  /** Markdown summary description. */
  readonly summaryDescriptionMd: string;
  /** Link to NJ Treasury filing resources. */
  readonly treasuryLink?: string;
  /** Additional information about the filing. */
  readonly additionalInfo?: string;
  /** How often this filing must be submitted. */
  readonly frequency?: string;
  /** Whether the filing supports extensions. */
  readonly extension?: boolean;
  /** Applicable tax rates description. */
  readonly taxRates?: string;
  /** How the filing can be submitted. */
  readonly filingMethod?: TaxFilingMethod | null;
  /** Additional details about the filing process. */
  readonly filingDetails?: string;
  /** Responsible government agency. */
  readonly agency?: TaxAgency | null;
}
