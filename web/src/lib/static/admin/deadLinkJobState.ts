import type { DeadLinkDebugLog } from "@/lib/static/admin/deadLinkDebugLog";
import type { ContentDeadLink } from "@/lib/static/admin/deadLinkTypes";

export type JobState = {
  scanId: string;
  startedAt: string;
  completedAt: string | null;
  debugLog: DeadLinkDebugLog;
  checkedUrls: number;
  totalUrls: number;
  isComplete: boolean;
  results: ContentDeadLink[] | null;
  error: string | null;
};

const GLOBAL_KEY = "__deadLinkJobState" as const;

declare const globalThis: {
  [GLOBAL_KEY]?: JobState | null;
} & typeof global;

export const getJobState = (): JobState | null => globalThis[GLOBAL_KEY] ?? null;

export const setJobState = (job: JobState | null): void => {
  globalThis[GLOBAL_KEY] = job;
};
