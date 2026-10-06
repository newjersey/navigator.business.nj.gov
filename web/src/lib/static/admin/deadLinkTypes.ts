export interface UrlRedirect {
  readonly fromUrl: string;
  readonly statusCode: number;
  readonly toUrl: string;
}

export type UrlFailureReason =
  | "http-error"
  | "rate-limit-exhausted"
  | "wait-budget-exceeded"
  | "connection-failed";

export interface UrlCheckResult {
  readonly alive: boolean;
  readonly statusCode: number | null;
  readonly statusText: string;
  readonly attemptCount: number;
  readonly finalUrl: string;
  readonly redirects: readonly UrlRedirect[];
  readonly failureReason?: UrlFailureReason;
}

export interface FoundUrl {
  readonly url: string;
  readonly field: string;
  readonly context: string;
  readonly statusCode?: number | null;
  readonly statusText?: string;
  readonly attemptCount?: number;
  readonly finalUrl?: string;
  readonly redirects?: readonly UrlRedirect[];
  readonly failureReason?: UrlFailureReason;
}

export interface ContentDeadLink {
  readonly file: string;
  readonly slug: string;
  readonly displayName: string;
  readonly collection: string;
  readonly cmsEditUrl: string;
  readonly pageUrl: string;
  readonly deadUrls: FoundUrl[];
}
