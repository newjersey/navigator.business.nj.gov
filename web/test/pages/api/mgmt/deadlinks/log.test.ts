import { createDeadLinkDebugLog } from "@/lib/static/admin/deadLinkDebugLog";
import { JobState, setJobState } from "@/lib/static/admin/deadLinkJobState";
import handler from "@/pages/api/mgmt/deadlinks/log";
import type { NextApiRequest, NextApiResponse } from "next";

interface MockResponse {
  readonly res: NextApiResponse;
  readonly headers: Record<string, string>;
  readonly statusCode: () => number;
  readonly body: () => unknown;
}

const createResponse = (): MockResponse => {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let body: unknown;
  const res = {
    setHeader: (name: string, value: string): void => {
      headers[name] = value;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (value: unknown) => {
      body = value;
      return res;
    },
    send: (value: unknown) => {
      body = value;
      return res;
    },
  } as unknown as NextApiResponse;
  return { res, headers, statusCode: () => statusCode, body: () => body };
};

const createRequest = (method: string, scanId?: string): NextApiRequest =>
  ({ method, query: scanId === undefined ? {} : { scanId } }) as unknown as NextApiRequest;

const generateJob = (overrides: Partial<JobState>): JobState => ({
  scanId: "scan-1",
  startedAt: "2026-10-05T12:00:00.000Z",
  completedAt: null,
  debugLog: createDeadLinkDebugLog({ scanId: "scan-1" }),
  checkedUrls: 0,
  totalUrls: 0,
  isComplete: false,
  results: null,
  error: null,
  ...overrides,
});

describe("/api/mgmt/deadlinks/log", () => {
  const originalEnabled = process.env.CHECK_DEAD_LINKS;

  beforeEach(() => {
    process.env.CHECK_DEAD_LINKS = "true";
    setJobState(null);
  });

  afterEach(() => {
    process.env.CHECK_DEAD_LINKS = originalEnabled;
    setJobState(null);
  });

  it("rejects methods other than GET", () => {
    const { res, statusCode } = createResponse();

    handler(createRequest("POST", "scan-1"), res);

    expect(statusCode()).toBe(405);
  });

  it("is unavailable when dead link checking is disabled", () => {
    process.env.CHECK_DEAD_LINKS = "false";
    const { res, statusCode } = createResponse();

    handler(createRequest("GET", "scan-1"), res);

    expect(statusCode()).toBe(403);
  });

  it("requires a scan id", () => {
    const { res, statusCode } = createResponse();

    handler(createRequest("GET"), res);

    expect(statusCode()).toBe(400);
  });

  it("returns 404 when no scan has run", () => {
    const { res, statusCode } = createResponse();

    handler(createRequest("GET", "scan-1"), res);

    expect(statusCode()).toBe(404);
  });

  it("refuses a scan id that belongs to a replaced scan", () => {
    setJobState(generateJob({ scanId: "scan-2" }));
    const { res, statusCode } = createResponse();

    handler(createRequest("GET", "scan-1"), res);

    expect(statusCode()).toBe(409);
  });

  it("downloads the log of a scan that is still running", () => {
    const job = generateJob({});
    job.debugLog.append({ event: "scan_started" });
    setJobState(job);
    const { res, statusCode, headers, body } = createResponse();

    handler(createRequest("GET", "scan-1"), res);

    expect(statusCode()).toBe(200);
    expect(headers["Content-Type"]).toBe("application/x-ndjson; charset=utf-8");
    expect(headers["Content-Disposition"]).toBe(
      'attachment; filename="content-hygiene-debug-scan-1.jsonl"',
    );
    expect(headers["Cache-Control"]).toBe("no-store");
    expect(String(body())).toContain('"event":"scan_started"');
  });

  it("downloads the log of a scan that failed", () => {
    const job = generateJob({ isComplete: true, error: "boom" });
    job.debugLog.append({ event: "scan_failed", errorType: "Error" });
    setJobState(job);
    const { res, statusCode, body } = createResponse();

    handler(createRequest("GET", "scan-1"), res);

    expect(statusCode()).toBe(200);
    expect(String(body())).toContain('"event":"scan_failed"');
  });
});
