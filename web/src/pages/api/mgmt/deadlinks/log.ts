import { getJobState } from "@/lib/static/admin/deadLinkJobState";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (process.env.CHECK_DEAD_LINKS !== "true") {
    res.status(403).json({ error: "Dead link checking is disabled" });
    return;
  }

  if (typeof req.query.scanId !== "string") {
    res.status(400).json({ error: "A scan ID is required" });
    return;
  }

  const job = getJobState();
  if (!job) {
    res.status(404).json({ error: "No scan is available" });
    return;
  }

  if (req.query.scanId !== job.scanId) {
    res.status(409).json({ error: "The requested scan is no longer available" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="content-hygiene-debug-${job.scanId}.jsonl"`,
  );
  res.status(200).send(job.debugLog.serialize());
}
