import {
  CONTENT_LINK_CHECK_SETTINGS,
  ContentLinkResponse,
  createContentLinkChecker,
  getRetryAfterDelayMs,
} from "@/lib/static/admin/contentLinkChecker";
import type { DeadLinkLogEvent } from "@/lib/static/admin/deadLinkDebugLog";

interface ResponseOptions {
  readonly status: number;
  readonly location?: string;
  readonly retryAfter?: string;
}

const generateResponse = ({
  status,
  location,
  retryAfter,
}: ResponseOptions): ContentLinkResponse => ({
  ok: status >= 200 && status < 300,
  status,
  headers: {
    get: (name: string): string | null => {
      if (name === "location") return location ?? null;
      if (name === "retry-after") return retryAfter ?? null;
      return null;
    },
  },
  body: null,
});

describe("getRetryAfterDelayMs", () => {
  const now = Date.parse("2026-10-05T12:00:00Z");

  it("reads a number of seconds", () => {
    expect(getRetryAfterDelayMs("10", now)).toBe(10_000);
  });

  it("reads an HTTP date", () => {
    expect(getRetryAfterDelayMs("Mon, 05 Oct 2026 12:00:10 GMT", now)).toBe(10_000);
  });

  it("treats a date in the past as no delay", () => {
    expect(getRetryAfterDelayMs("Mon, 05 Oct 2026 11:59:00 GMT", now)).toBe(0);
  });

  it("ignores missing and invalid values", () => {
    expect(getRetryAfterDelayMs(null, now)).toBeNull();
    expect(getRetryAfterDelayMs("-1", now)).toBeNull();
    expect(getRetryAfterDelayMs("1.5", now)).toBeNull();
    expect(getRetryAfterDelayMs("soon", now)).toBeNull();
  });
});

describe("createContentLinkChecker", () => {
  const rateLimited = (retryAfter?: string): ContentLinkResponse =>
    generateResponse({ status: 429, retryAfter });

  const checkToCompletion = async (
    checker: ReturnType<typeof createContentLinkChecker>,
    url: string,
  ): ReturnType<ReturnType<typeof createContentLinkChecker>["checkUrl"]> => {
    const pending = checker.checkUrl(url);
    await jest.runAllTimersAsync();
    return pending;
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("reports a reachable URL after a single HEAD request", async () => {
    const fetchUrl = jest.fn().mockResolvedValue(generateResponse({ status: 200 }));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://example.com/");

    expect(result).toMatchObject({ alive: true, statusCode: 200, attemptCount: 1 });
    expect(fetchUrl).toHaveBeenCalledTimes(1);
  });

  it("falls back to GET when HEAD is rejected", async () => {
    const fetchUrl = jest
      .fn()
      .mockResolvedValueOnce(generateResponse({ status: 405 }))
      .mockResolvedValueOnce(generateResponse({ status: 200 }));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://example.com/");

    expect(result.alive).toBe(true);
    expect(fetchUrl.mock.calls.map(([, options]) => options.method)).toEqual(["HEAD", "GET"]);
  });

  it("fails after three 429 responses and never falls back to GET", async () => {
    const fetchUrl = jest.fn().mockResolvedValue(rateLimited("1"));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://www.njeda.gov/example/");

    expect(fetchUrl).toHaveBeenCalledTimes(3);
    expect(fetchUrl.mock.calls.map(([, options]) => options.method)).toEqual([
      "HEAD",
      "HEAD",
      "HEAD",
    ]);
    expect(result).toMatchObject({
      alive: false,
      statusCode: 429,
      attemptCount: 3,
      failureReason: "rate-limit-exhausted",
    });
    expect(result.statusText).toContain("failed after 3 attempts");
  });

  it("succeeds when a retry is no longer rate limited", async () => {
    const fetchUrl = jest
      .fn()
      .mockResolvedValueOnce(rateLimited("1"))
      .mockResolvedValue(generateResponse({ status: 200 }));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://www.njeda.gov/example/");

    expect(result).toMatchObject({ alive: true, statusCode: 200, attemptCount: 2 });
  });

  it("reports the final 429 and keeps the redirect chain when a redirect lands on a rate limit", async () => {
    const fetchUrl = jest
      .fn()
      .mockImplementation(async (url: string) =>
        url === "http://njeda.gov/example/"
          ? generateResponse({ status: 301, location: "https://www.njeda.gov/example/" })
          : rateLimited("1"),
      );
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "http://njeda.gov/example/");

    expect(result).toMatchObject({
      alive: false,
      statusCode: 429,
      attemptCount: 3,
      finalUrl: "https://www.njeda.gov/example/",
      redirects: [
        {
          fromUrl: "http://njeda.gov/example/",
          statusCode: 301,
          toUrl: "https://www.njeda.gov/example/",
        },
      ],
    });
  });

  it("resolves relative redirect locations", async () => {
    const fetchUrl = jest
      .fn()
      .mockResolvedValueOnce(generateResponse({ status: 302, location: "/moved" }))
      .mockResolvedValue(generateResponse({ status: 200 }));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://example.com/start");

    expect(result.finalUrl).toBe("https://example.com/moved");
  });

  it("gives up on an endless redirect loop", async () => {
    const fetchUrl = jest
      .fn()
      .mockResolvedValue(generateResponse({ status: 302, location: "https://example.com/loop" }));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://example.com/loop");

    expect(result).toMatchObject({ alive: false, failureReason: "connection-failed" });
    expect(fetchUrl).toHaveBeenCalledTimes(CONTENT_LINK_CHECK_SETTINGS.maxRedirects + 1);
  });

  it("stops without retrying when the requested wait exceeds the two-minute budget", async () => {
    const fetchUrl = jest.fn().mockResolvedValue(rateLimited("300"));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://www.njeda.gov/example/");

    expect(fetchUrl).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      alive: false,
      statusCode: 429,
      attemptCount: 1,
      failureReason: "wait-budget-exceeded",
    });
    expect(result.statusText).toContain("longer than 2 minutes");
  });

  it("counts waiting across retries against the budget", async () => {
    const fetchUrl = jest.fn().mockResolvedValue(rateLimited("90"));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://www.njeda.gov/example/");

    expect(fetchUrl).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ attemptCount: 2, failureReason: "wait-budget-exceeded" });
  });

  it("waits for the Retry-After delay before retrying", async () => {
    const fetchUrl = jest
      .fn()
      .mockResolvedValueOnce(rateLimited("30"))
      .mockResolvedValue(generateResponse({ status: 200 }));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const pending = checker.checkUrl("https://www.njeda.gov/example/");
    await jest.advanceTimersByTimeAsync(29_000);
    expect(fetchUrl).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1000);
    expect(fetchUrl).toHaveBeenCalledTimes(2);
    const result = await pending;
    expect(result.alive).toBe(true);
  });

  it("backs off exponentially with jitter when there is no Retry-After header", async () => {
    const events: DeadLinkLogEvent[] = [];
    const fetchUrl = jest.fn().mockResolvedValue(rateLimited());
    const checker = createContentLinkChecker({
      fetch: fetchUrl,
      onEvent: (event) => events.push(event),
      random: () => 0.5,
    });

    await checkToCompletion(checker, "https://www.njeda.gov/example/");

    const cooldownDelays = events
      .filter((event) => event.event === "domain_cooldown")
      .map((event) => event.delayMs);
    expect(cooldownDelays).toEqual([5500, 10_500, 20_500]);
  });

  it("pauses every URL on a domain that returned 429 while other domains proceed", async () => {
    const callTimes = new Map<string, number[]>();
    const start = Date.now();
    const fetchUrl = jest.fn().mockImplementation(async (url: string) => {
      callTimes.set(url, [...(callTimes.get(url) ?? []), Date.now() - start]);
      if (url === "https://www.njeda.gov/a/" && callTimes.get(url)?.length === 1) {
        return rateLimited("20");
      }
      return generateResponse({ status: 200 });
    });
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const pending = Promise.all([
      checker.checkUrl("https://www.njeda.gov/a/"),
      checker.checkUrl("https://njeda.gov/b/"),
      checker.checkUrl("https://other.example.com/"),
    ]);
    await jest.runAllTimersAsync();
    await pending;

    expect(callTimes.get("https://other.example.com/")?.[0]).toBeLessThan(1000);
    expect(callTimes.get("https://njeda.gov/b/")?.[0]).toBeGreaterThanOrEqual(20_000);
  });

  it("reports a connection failure when the request throws", async () => {
    const fetchUrl = jest.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
    const checker = createContentLinkChecker({ fetch: fetchUrl });

    const result = await checkToCompletion(checker, "https://missing.example.com/");

    expect(result).toMatchObject({
      alive: false,
      statusCode: null,
      statusText: "Connection Failed",
      failureReason: "connection-failed",
    });
  });

  it("logs requests, cooldown periods, and retries", async () => {
    const events: DeadLinkLogEvent[] = [];
    const fetchUrl = jest
      .fn()
      .mockResolvedValueOnce(rateLimited("1"))
      .mockResolvedValue(generateResponse({ status: 200 }));
    const checker = createContentLinkChecker({ fetch: fetchUrl, onEvent: (e) => events.push(e) });

    await checkToCompletion(checker, "https://www.njeda.gov/example/");

    expect(events.map((event) => event.event)).toEqual([
      "request_queued",
      "request_started",
      "request_completed",
      "domain_cooldown",
      "retry_scheduled",
      "request_queued",
      "request_started",
      "request_completed",
    ]);
  });
});
