/** A business certification available in New Jersey. */
export type Certification = {
  /** Unique identifier for the certification. */
  readonly id: string;
  /** Source markdown filename without extension. */
  readonly filename: string;
  /** Display name of the certification. */
  readonly name: string;
  /** URL-friendly slug for routing. */
  readonly urlSlug: string;
  /** Markdown summary description. */
  readonly summaryDescriptionMd: string;
  /** Full markdown content body. */
  readonly contentMd: string;
  /** Short description shown on sidebar cards. */
  readonly sidebarCardBodyText: string;
  /** External link for the primary call-to-action. */
  readonly callToActionLink: string | undefined;
  /** Label text for the primary call-to-action. */
  readonly callToActionText: string | undefined;
  /** Certifying agency or agencies. */
  readonly agency: string[] | null | undefined;
  /** Business ownership types eligible for this certification. */
  readonly applicableOwnershipTypes: string[] | null | undefined;
  /** Whether this is a Small Business Enterprise certification. */
  readonly isSbe: boolean;
};
