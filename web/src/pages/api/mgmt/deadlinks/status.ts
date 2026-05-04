import { getJobState } from "@/lib/static/admin/deadLinkJobState";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const job = getJobState();

  if (!job) {
    res.status(404).json({ error: "No scan in progress" });
    return;
  }

  res.status(200).json({
    checkedUrls: job.checkedUrls,
    totalUrls: job.totalUrls,
    isComplete: job.isComplete,
    results: job.isComplete ? job.results : null,
    error: job.error,
  });
}
