import { getJobState, setJobState } from "@/lib/static/admin/deadLinkJobState";
import { findDeadContentLinks } from "@/lib/static/admin/findDeadLinks";
import handler from "@/pages/api/mgmt/deadlinks/start";
import { waitFor } from "@testing-library/react";
import type { NextApiRequest, NextApiResponse } from "next";

jest.mock("@/lib/static/admin/findDeadLinks", () => ({ findDeadContentLinks: jest.fn() }));
const mockFindDeadContentLinks = findDeadContentLinks as jest.Mock;

const createResponse = (): {
  res: NextApiResponse;
  statusCode: () => number;
  body: () => unknown;
} => {
  let statusCode = 0;
  let body: unknown;
  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (value: unknown) => {
      body = value;
      return res;
    },
  } as unknown as NextApiResponse;
  return { res, statusCode: () => statusCode, body: () => body };
};

const startScan = (): ReturnType<typeof createResponse> => {
  const response = createResponse();
  handler({ method: "POST" } as NextApiRequest, response.res);
  return response;
};

const waitForScanToFinish = (): Promise<void> =>
  waitFor(() => expect(getJobState()?.isComplete).toBe(true));

describe("/api/mgmt/deadlinks/start", () => {
  const originalEnabled = process.env.CHECK_DEAD_LINKS;

  beforeEach(() => {
    process.env.CHECK_DEAD_LINKS = "true";
    setJobState(null);
    mockFindDeadContentLinks.mockReset();
  });

  afterEach(() => {
    process.env.CHECK_DEAD_LINKS = originalEnabled;
    setJobState(null);
  });

  it("starts a scan and returns its id", () => {
    mockFindDeadContentLinks.mockReturnValue(new Promise(() => {}));

    const { statusCode, body } = startScan();

    expect(statusCode()).toBe(202);
    expect(body()).toEqual({ status: "started", scanId: getJobState()?.scanId });
    expect(getJobState()?.isComplete).toBe(false);
  });

  it("refuses to start while a scan is in progress", () => {
    mockFindDeadContentLinks.mockReturnValue(new Promise(() => {}));
    startScan();

    const { statusCode } = startScan();

    expect(statusCode()).toBe(409);
  });

  it("records the results and a completed log when the scan finishes", async () => {
    mockFindDeadContentLinks.mockResolvedValue([]);

    startScan();
    await waitForScanToFinish();

    const job = getJobState();
    expect(job?.isComplete).toBe(true);
    expect(job?.results).toEqual([]);
    expect(job?.completedAt).not.toBeNull();
    expect(job?.debugLog.serialize()).toContain('"event":"scan_completed"');
  });

  it("records the error and keeps the log when the scan fails", async () => {
    mockFindDeadContentLinks.mockRejectedValue(new Error("boom"));

    startScan();
    await waitForScanToFinish();

    const job = getJobState();
    expect(job?.isComplete).toBe(true);
    expect(job?.error).toBe("boom");
    expect(job?.debugLog.serialize()).toContain('"event":"scan_failed"');
  });

  it("allows a new scan after the previous one has finished", async () => {
    mockFindDeadContentLinks.mockResolvedValue([]);
    startScan();
    await waitForScanToFinish();
    const firstScanId = getJobState()?.scanId;

    const { statusCode } = startScan();

    expect(statusCode()).toBe(202);
    expect(getJobState()?.scanId).not.toBe(firstScanId);
  });
});
