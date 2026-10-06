import { CONTENT_LINK_CHECK_SETTINGS } from "@/lib/static/admin/contentLinkChecker";
import { createDeadLinkDebugLog, DeadLinkLogEvent } from "@/lib/static/admin/deadLinkDebugLog";
import { getJobState, JobState, setJobState } from "@/lib/static/admin/deadLinkJobState";
import type { ContentDeadLink } from "@/lib/static/admin/deadLinkTypes";
import { findDeadContentLinks } from "@/lib/static/admin/findDeadLinks";
import type { NextApiRequest, NextApiResponse } from "next";

const countDeadUrls = (results: ContentDeadLink[]): number =>
  results.reduce((sum, item) => sum + item.deadUrls.length, 0);

const runScan = async (job: JobState): Promise<void> => {
  const onProgress = (checkedUrls: number, totalUrls: number): void => {
    job.checkedUrls = checkedUrls;
    job.totalUrls = totalUrls;
  };

  const onEvent = (event: DeadLinkLogEvent): void => {
    job.debugLog.append(event);
  };

  job.debugLog.append({ event: "scan_started", settings: CONTENT_LINK_CHECK_SETTINGS });

  try {
    const results = await findDeadContentLinks({ onProgress, onEvent });
    job.results = results;
    job.debugLog.append({
      event: "scan_completed",
      totalUrls: job.totalUrls,
      deadUrls: countDeadUrls(results),
      contentItems: results.length,
      elapsedMs: Date.now() - Date.parse(job.startedAt),
    });
  } catch (error: unknown) {
    job.error = error instanceof Error ? error.message : String(error);
    job.debugLog.append({
      event: "scan_failed",
      errorType: error instanceof Error ? error.name : "UnknownError",
      totalUrls: job.totalUrls,
      elapsedMs: Date.now() - Date.parse(job.startedAt),
    });
  } finally {
    job.completedAt = new Date().toISOString();
    job.isComplete = true;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (process.env.CHECK_DEAD_LINKS !== "true") {
    res.status(403).json({ error: "Dead link checking is disabled" });
    return;
  }

  const existing = getJobState();
  if (existing && !existing.isComplete) {
    res.status(409).json({ error: "A scan is already in progress" });
    return;
  }

  const scanId = crypto.randomUUID();
  const job: JobState = {
    scanId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    debugLog: createDeadLinkDebugLog({ scanId }),
    checkedUrls: 0,
    totalUrls: 0,
    isComplete: false,
    results: null,
    error: null,
  };
  setJobState(job);

  // runScan records failures on the job, so the scan runs in the background after this responds.
  void runScan(job);

  res.status(202).json({ status: "started", scanId });
}
