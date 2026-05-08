/** A license-related calendar event type defining renewal and expiration behavior. */
export interface LicenseEventType {
  /** Agency responsible for issuing the license. */
  readonly issuingAgency: string;
  /** Disclaimer text shown with the license event. */
  readonly disclaimerText: string;
  /** Display name for renewal events. */
  readonly renewalEventDisplayName: string;
  /** Display name for expiration events. */
  readonly expirationEventDisplayName: string;
  /** Source markdown filename without extension. */
  readonly filename: string;
  /** URL-friendly slug for routing. */
  readonly urlSlug: string;
  /** External link for the primary call-to-action. */
  readonly callToActionLink?: string;
  /** Label text for the primary call-to-action. */
  readonly callToActionText?: string;
  /** Full markdown content body. */
  readonly contentMd: string;
  /** Markdown summary description. */
  readonly summaryDescriptionMd?: string;
  /** Name of the associated license. */
  readonly licenseName: string;
}
