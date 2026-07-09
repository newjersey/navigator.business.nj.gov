/** A license/certification card on the Licensing & Certification Guide page. */
export interface License {
  /** Card title. */
  name: string;
  /** URL-friendly slug. */
  urlSlug: string;
  /** Legacy Webflow CMS identifier. */
  webflowId?: string;
  /** Webflow display name (may differ from `name`). */
  webflowName?: string;
  /** "Who it's for" classification, e.g. "LICENSE" or "CERTIFICATION". */
  licenseCertificationClassification?: string;
  /**
   * Clean classification key from Webflow (`business-license`,
   * `individual-license`, `object-vehicle`, `school-course`). Drives the
   * "Who it's for" label; prefer this over `licenseCertificationClassification`.
   */
  webflowType?: string;
  /** Resolved industry display name. */
  industry?: string;
  /** Summary description markdown rendered in the card body. */
  summaryDescriptionMd?: string;
  /** Resolved agency display name. */
  agency?: string;
  /** Agency division / additional context. */
  division?: string;
  /** Agency website URL; the agency name links to this when present. */
  agencyWebsite?: string;
  /** Division phone number. */
  divisionPhone?: string;
  /** Primary CTA button label. */
  callToActionText?: string;
  /** Primary CTA button link. */
  callToActionLink?: string;
}
