/** A single step in an industry roadmap linking to a task. */
export interface RoadmapStep {
  /** Step number in the roadmap sequence. */
  readonly step: number;
  /** Sort weight within the step (lower values appear first). */
  readonly weight: number;
  /** Filename of the associated task. */
  readonly task: string;
  /** Whether this step is required to complete the roadmap. */
  readonly required?: boolean;
  /** Filename of an associated license task. */
  readonly licenseTask?: string;
}

/** A business industry with its associated roadmap configuration. */
export interface Industry {
  /** Unique identifier for the industry. */
  readonly id: string;
  /** Display name of the industry. */
  readonly name: string;
  /** NAICS codes associated with this industry. */
  readonly naicsCodes?: string;
  /** Default sector this industry belongs to. */
  readonly defaultSectorId?: string;
  /** Whether businesses in this industry can have a permanent location. */
  readonly canHavePermanentLocation?: boolean;
  /** Ordered steps in the industry's roadmap. */
  readonly roadmapSteps: RoadmapStep[];
}

/** A business sector containing related industries. */
export interface Sector {
  /** Unique identifier for the sector. */
  readonly id: string;
  /** Display name of the sector. */
  readonly name: string;
  /** IDs of non-essential questions associated with this sector. */
  readonly nonEssentialQuestionsIds: string[];
  /** Industries that belong to this sector. */
  readonly industries: Industry[];
}
