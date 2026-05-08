/** A reference to a related task used for dependency linking. */
export interface TaskLink {
  /** Display name of the linked task. */
  readonly name: string;
  /** Unique identifier for the linked task. */
  readonly id: string;
  /** URL-friendly slug for routing. */
  readonly urlSlug: string;
  /** Source markdown filename without extension. */
  readonly filename: string;
}

/** A roadmap task that guides a business through a required step. */
export interface Task {
  /** Unique identifier for the task. */
  readonly id: string;
  /** Optional display name override. */
  readonly displayname?: string;
  /** Source markdown filename without extension. */
  readonly filename: string;
  /** Position in the roadmap step sequence. */
  readonly stepNumber?: number;
  /** Display name of the task. */
  readonly name: string;
  /** URL-friendly slug for routing. */
  readonly urlSlug: string;
  /** External link for the primary call-to-action. */
  readonly callToActionLink: string;
  /** Label text for the primary call-to-action. */
  readonly callToActionText: string;
  /** Full markdown content body. */
  readonly contentMd: string;
  /** Markdown summary description. */
  readonly summaryDescriptionMd: string;
  /** Tasks that must be completed before this one is unlocked. */
  readonly unlockedBy: TaskLink[];
  /** Whether this task is required for the roadmap. */
  readonly required?: boolean;
  /** Identifier of the responsible agency. */
  readonly agencyId?: string;
  /** Additional context about the responsible agency. */
  readonly agencyAdditionalContext?: string;
  /** Name of an associated form. */
  readonly formName?: string;
  /** Whether this task is hidden from the default roadmap view. */
  readonly hidden?: true;
  /** Whether this task requires a physical business location. */
  readonly requiresLocation?: boolean;
  /** Industry this task is specific to. */
  readonly industryId?: string;
  /** Label for the roadmap step this task belongs to. */
  readonly stepLabel?: string;
}
