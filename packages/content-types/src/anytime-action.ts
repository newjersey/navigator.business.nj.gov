/** A category grouping for Anytime Actions. */
export interface AnytimeActionCategory {
  /** Unique identifier for the category. */
  readonly categoryId: string;
  /** Display name of the category. */
  readonly categoryName: string;
}

/** Base interface for actions a business can take at any time. */
export interface AnytimeAction {
  /** Display name of the action. */
  readonly name: string;
  /** Source markdown filename without extension. */
  readonly filename: string;
  /** Discriminator for the action variant. */
  readonly type: string;
  /** Alternative search terms for this action. */
  readonly synonyms?: string[];
}

/** An action a business can perform at any time, outside the roadmap sequence. */
export interface AnytimeActionTask extends AnytimeAction {
  /** Unique identifier for the task. */
  readonly id: string;
  /** Categories this action belongs to. */
  readonly category: AnytimeActionCategory[];
  /** URL-friendly slug for routing. */
  readonly urlSlug: string;
  /** External link for the primary call-to-action. */
  readonly callToActionLink?: string;
  /** Label text for the primary call-to-action. */
  readonly callToActionText?: string;
  /** Agency responsible for this action. */
  readonly issuingAgency?: string;
  /** Whether to feature this in the recommended section. */
  readonly moveToRecommendedForYouSection?: boolean;
  /** Industries this action applies to. */
  readonly industryIds: string[];
  /** Sectors this action applies to. */
  readonly sectorIds: string[];
  /** Whether this action applies to all users regardless of profile. */
  readonly applyToAllUsers: boolean;
  /** Markdown summary description. */
  readonly summaryDescriptionMd: string;
  /** Full markdown content body. */
  readonly contentMd: string;
  /** Short plain-text description. */
  readonly description?: string;
  /** Additional metadata used for search matching. */
  readonly searchMetaDataMatch?: string;
}

/** A license reinstatement action for expired or lapsed licenses. */
export interface AnytimeActionLicenseReinstatement extends AnytimeAction {
  /** Name of the license to be reinstated. */
  readonly licenseName: string;
  /** URL-friendly slug for routing. */
  readonly urlSlug: string;
  /** Full markdown content body. */
  readonly contentMd: string;
  /** External link for the primary call-to-action. */
  readonly callToActionLink: string | undefined;
  /** Label text for the primary call-to-action. */
  readonly callToActionText: string | undefined;
  /** Agency responsible for issuing the license. */
  readonly issuingAgency: string;
  /** Markdown summary description. */
  readonly summaryDescriptionMd: string;
  /** Short plain-text description. */
  readonly description?: string;
  /** Additional metadata used for search matching. */
  readonly searchMetaDataMatch?: string;
  /** Categories this reinstatement belongs to. */
  readonly category: AnytimeActionCategory[];
}
