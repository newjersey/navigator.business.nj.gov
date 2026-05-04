import { findDeadContentLinks } from "@/lib/static/admin/findDeadLinks";
import { getJobState, setJobState } from "@/lib/static/admin/deadLinkJobState";
import type { NextApiRequest, NextApiResponse } from "next";

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

  setJobState({
    checkedUrls: 0,
    totalUrls: 0,
    isComplete: false,
    results: null,
    error: null,
  });

  findDeadContentLinks((checked, total) => {
    const job = getJobState();
    if (job) {
      job.checkedUrls = checked;
      job.totalUrls = total;
    }
  })
    .then((results) => {
      const job = getJobState();
      if (job) {
        job.results = results;
        job.isComplete = true;
      }
    })
    .catch((error) => {
      const job = getJobState();
      if (job) {
        job.error = error instanceof Error ? error.message : String(error);
        job.isComplete = true;
      }
    });

  res.status(202).json({ status: "started" });
}
