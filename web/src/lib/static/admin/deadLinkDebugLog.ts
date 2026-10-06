import type { UrlFailureReason } from "@/lib/static/admin/deadLinkTypes";

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

export type DeadLinkLogEventName =
  | "scan_started"
  | "urls_collected"
  | "request_queued"
  | "request_started"
  | "request_completed"
  | "request_failed"
  | "redirect"
  | "domain_cooldown"
  | "retry_scheduled"
  | "url_finalized"
  | "scan_completed"
  | "scan_failed";

export interface DeadLinkLogEvent {
  readonly event: DeadLinkLogEventName;
  readonly originalUrl?: string;
  readonly url?: string;
  readonly method?: "HEAD" | "GET";
  readonly attempt?: number;
  readonly domain?: string;
  readonly statusCode?: number | null;
  readonly location?: string | null;
  readonly retryAfter?: string | null;
  readonly delayMs?: number;
  readonly waitedMs?: number;
  readonly elapsedMs?: number;
  readonly errorType?: string;
  readonly alive?: boolean;
  readonly failureReason?: UrlFailureReason;
  readonly fileCount?: number;
  readonly totalUrls?: number;
  readonly deadUrls?: number;
  readonly contentItems?: number;
  readonly settings?: Readonly<Record<string, number>>;
}

export interface DeadLinkDebugLogOptions {
  readonly scanId: string;
  readonly maxBytes?: number;
}

export interface DeadLinkDebugLog {
  readonly append: (event: DeadLinkLogEvent) => void;
  readonly serialize: () => string;
  readonly droppedEvents: number;
}

const isFinalEvent = (event: DeadLinkLogEvent): boolean =>
  event.event === "scan_completed" || event.event === "scan_failed";

/**
 * Collects scan activity as JSON Lines. Detail events stop being stored once the size limit is
 * reached, but the scan's final event is always kept so a truncated log still shows the outcome.
 */
export const createDeadLinkDebugLog = ({
  scanId,
  maxBytes = DEFAULT_MAX_BYTES,
}: DeadLinkDebugLogOptions): DeadLinkDebugLog => {
  const lines: string[] = [];
  let sizeBytes = 0;
  let droppedEvents = 0;
  let finalLine: string | null = null;

  const append = (event: DeadLinkLogEvent): void => {
    const line = JSON.stringify({ scanId, timestamp: new Date().toISOString(), ...event });

    if (isFinalEvent(event)) {
      finalLine = line;
      return;
    }

    const lineBytes = Buffer.byteLength(line, "utf8") + 1;
    if (sizeBytes + lineBytes > maxBytes) {
      droppedEvents++;
      return;
    }

    lines.push(line);
    sizeBytes += lineBytes;
  };

  const serialize = (): string => {
    const snapshot = [...lines];

    if (droppedEvents > 0) {
      snapshot.push(JSON.stringify({ scanId, event: "log_truncated", droppedEvents }));
    }
    if (finalLine !== null) snapshot.push(finalLine);

    return snapshot.length === 0 ? "" : `${snapshot.join("\n")}\n`;
  };

  return {
    append,
    serialize,
    get droppedEvents(): number {
      return droppedEvents;
    },
  };
};
