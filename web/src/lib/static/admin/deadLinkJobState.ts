import { ContentDeadLink } from "@/lib/static/admin/findDeadLinks";

export type JobState = {
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
