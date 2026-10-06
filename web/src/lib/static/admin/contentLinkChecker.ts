import type { DeadLinkLogEvent } from "@/lib/static/admin/deadLinkDebugLog";
import {
  CooldownWaitExceededError,
  createDeadLinkRequestScheduler,
  getDeadLinkDomain,
} from "@/lib/static/admin/deadLinkRequestScheduler";
import type { UrlCheckResult, UrlRedirect } from "@/lib/static/admin/deadLinkTypes";

export const CONTENT_LINK_CHECK_SETTINGS = {
  globalConcurrency: 10,
  requestIntervalMs: 1000,
  requestTimeoutMs: 10_000,
  maxAttempts: 3,
  maxRedirects: 10,
  baseBackoffMs: 5000,
  maxBackoffJitterMs: 1000,
  maxRetryWaitMs: 120_000,
} as const;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const STATUS_TEXT: Record<number, string> = {
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  410: "Gone",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  521: "Web Server Is Down",
  522: "Connection Timed Out",
  523: "Origin Is Unreachable",
};

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

type HttpMethod = "HEAD" | "GET";

export interface ContentLinkResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly headers: { get(name: string): string | null };
  readonly body?: { cancel(): Promise<void> } | null;
}

export interface ContentLinkCheckerOptions {
  readonly fetch: (url: string, options: RequestInit) => Promise<ContentLinkResponse>;
  readonly onEvent?: (event: DeadLinkLogEvent) => void;
  readonly random?: () => number;
}

export interface ContentLinkChecker {
  readonly checkUrl: (url: string) => Promise<UrlCheckResult>;
}

interface RequestOptions {
  readonly originalUrl: string;
  readonly url: string;
  readonly method: HttpMethod;
  readonly attempt: number;
}

interface FollowRedirectsOptions extends RequestOptions {
  readonly redirects: UrlRedirect[];
}

interface CheckedResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly url: string;
  readonly method: HttpMethod;
  readonly location: string | null;
  /** How long the domain was told to cool down. Set only for 429 responses. */
  readonly cooldownMs: number | null;
}

interface AttemptState {
  readonly url: string;
  readonly attempt: number;
  readonly redirects: readonly UrlRedirect[];
}

const formatMinutes = (milliseconds: number): string => {
  const minutes = milliseconds / 60_000;
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
};

const RATE_LIMIT_TEXT = STATUS_TEXT[429];

/** Reads a Retry-After header, which is either a number of seconds or an HTTP date. */
export const getRetryAfterDelayMs = (retryAfter: string | null, now: number): number | null => {
  if (retryAfter === null) return null;
  const value = retryAfter.trim();

  if (/^\d+$/.test(value)) return Number(value) * 1000;

  // Date.parse accepts strings such as "-1" and "1.5", which are not valid Retry-After values.
  if (/^[+-]?\d+(?:\.\d+)?$/.test(value)) return null;

  const retryAt = Date.parse(value);
  return Number.isFinite(retryAt) ? Math.max(0, retryAt - now) : null;
};

const discardBody = async (response: ContentLinkResponse): Promise<void> => {
  try {
    await response.body?.cancel();
  } catch {
    // The status is already known; failing to release the stream must not change the result.
  }
};

export const createContentLinkChecker = ({
  fetch: fetchUrl,
  onEvent,
  random = Math.random,
}: ContentLinkCheckerOptions): ContentLinkChecker => {
  const settings = CONTENT_LINK_CHECK_SETTINGS;
  const scheduler = createDeadLinkRequestScheduler(settings);

  const getCooldownMs = (attempt: number, retryAfter: string | null): number => {
    const retryAfterMs = getRetryAfterDelayMs(retryAfter, Date.now());
    if (retryAfterMs !== null) return retryAfterMs;

    const backoffMs = settings.baseBackoffMs * 2 ** (attempt - 1);
    return backoffMs + Math.floor(random() * settings.maxBackoffJitterMs);
  };

  const request = async ({
    originalUrl,
    url,
    method,
    attempt,
  }: RequestOptions): Promise<CheckedResponse> => {
    const domain = getDeadLinkDomain(url);
    onEvent?.({ event: "request_queued", originalUrl, url, method, attempt, domain });

    const release = await scheduler.acquire({ url, maxCooldownWaitMs: settings.maxRetryWaitMs });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), settings.requestTimeoutMs);
    const startedAt = Date.now();

    onEvent?.({ event: "request_started", originalUrl, url, method, attempt });

    try {
      const response = await fetchUrl(url, {
        method,
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": BROWSER_UA },
      });

      const location = response.headers.get("location");
      const retryAfter = response.headers.get("retry-after");
      onEvent?.({
        event: "request_completed",
        originalUrl,
        url,
        method,
        attempt,
        statusCode: response.status,
        location,
        retryAfter,
        elapsedMs: Date.now() - startedAt,
      });

      let cooldownMs: number | null = null;
      if (response.status === 429) {
        cooldownMs = getCooldownMs(attempt, retryAfter);
        // Applied before this request's slot is released so queued requests cannot slip through.
        scheduler.cooldown(url, cooldownMs);
        onEvent?.({
          event: "domain_cooldown",
          originalUrl,
          url,
          attempt,
          domain,
          retryAfter,
          delayMs: cooldownMs,
          statusCode: 429,
        });
      }

      await discardBody(response);

      return { ok: response.ok, status: response.status, url, method, location, cooldownMs };
    } catch (error: unknown) {
      onEvent?.({
        event: "request_failed",
        originalUrl,
        url,
        method,
        attempt,
        elapsedMs: Date.now() - startedAt,
        errorType: controller.signal.aborted
          ? "Timeout"
          : error instanceof Error
            ? error.name
            : "UnknownError",
      });
      throw error;
    } finally {
      clearTimeout(timeout);
      release();
    }
  };

  const followRedirects = async ({
    originalUrl,
    url,
    method,
    attempt,
    redirects,
  }: FollowRedirectsOptions): Promise<CheckedResponse> => {
    let currentUrl = url;

    for (let hop = 0; hop <= settings.maxRedirects; hop++) {
      const response = await request({ originalUrl, url: currentUrl, method, attempt });

      if (!REDIRECT_STATUSES.has(response.status) || !response.location) return response;
      if (hop === settings.maxRedirects) break;

      const nextUrl = new URL(response.location, currentUrl).href;
      redirects.push({ fromUrl: currentUrl, statusCode: response.status, toUrl: nextUrl });
      onEvent?.({
        event: "redirect",
        originalUrl,
        url: currentUrl,
        method,
        attempt,
        statusCode: response.status,
        location: nextUrl,
      });
      currentUrl = nextUrl;
    }

    throw new Error("Redirect limit exceeded");
  };

  const buildResponseResult = (
    response: CheckedResponse,
    { attempt, redirects }: AttemptState,
  ): UrlCheckResult => {
    if (response.ok) {
      return {
        alive: true,
        statusCode: response.status,
        statusText: "OK",
        attemptCount: attempt,
        finalUrl: response.url,
        redirects,
      };
    }

    const isRateLimited = response.status === 429;
    return {
      alive: false,
      statusCode: response.status,
      statusText: isRateLimited
        ? `${RATE_LIMIT_TEXT} — failed after ${attempt} attempts`
        : STATUS_TEXT[response.status] || `HTTP ${response.status}`,
      attemptCount: attempt,
      finalUrl: response.url,
      redirects,
      failureReason: isRateLimited ? "rate-limit-exhausted" : "http-error",
    };
  };

  const buildWaitBudgetResult = (
    statusCode: number | null,
    { url, attempt, redirects }: AttemptState,
  ): UrlCheckResult => ({
    alive: false,
    statusCode,
    statusText: `${RATE_LIMIT_TEXT} — server asked to wait longer than ${formatMinutes(settings.maxRetryWaitMs)}`,
    attemptCount: attempt,
    finalUrl: url,
    redirects,
    failureReason: "wait-budget-exceeded",
  });

  const checkUrl = async (originalUrl: string): Promise<UrlCheckResult> => {
    const redirects: UrlRedirect[] = [];
    let requestUrl = originalUrl;
    let method: HttpMethod = "HEAD";
    let waitedMs = 0;
    let lastStatus: number | null = null;
    let attempt = 1;

    const attemptState = (): AttemptState => ({ url: requestUrl, attempt, redirects });

    try {
      for (; ; attempt++) {
        let response = await followRedirects({
          originalUrl,
          url: requestUrl,
          method,
          attempt,
          redirects,
        });

        // A 429 is retried as the same kind of request; switching to GET would add load.
        if (!response.ok && response.status !== 429 && response.method === "HEAD") {
          response = await followRedirects({
            originalUrl,
            url: response.url,
            method: "GET",
            attempt,
            redirects,
          });
        }

        requestUrl = response.url;
        method = response.method;
        lastStatus = response.status;

        if (response.status !== 429 || attempt === settings.maxAttempts) {
          return buildResponseResult(response, attemptState());
        }

        const cooldownMs = response.cooldownMs ?? 0;
        if (waitedMs + cooldownMs > settings.maxRetryWaitMs) {
          return buildWaitBudgetResult(response.status, attemptState());
        }

        waitedMs += cooldownMs;
        onEvent?.({
          event: "retry_scheduled",
          originalUrl,
          url: requestUrl,
          method,
          attempt: attempt + 1,
          statusCode: 429,
          delayMs: cooldownMs,
          waitedMs,
        });
      }
    } catch (error: unknown) {
      if (error instanceof CooldownWaitExceededError) {
        return buildWaitBudgetResult(lastStatus, attemptState());
      }

      return {
        alive: false,
        statusCode: null,
        statusText: "Connection Failed",
        attemptCount: attempt,
        finalUrl: requestUrl,
        redirects,
        failureReason: "connection-failed",
      };
    }
  };

  return { checkUrl };
};
