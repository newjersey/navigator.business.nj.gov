import { createDeadLinkDebugLog } from "@/lib/static/admin/deadLinkDebugLog";

const parseLines = (serialized: string): Record<string, unknown>[] =>
  serialized
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>);

describe("createDeadLinkDebugLog", () => {
  it("serializes events as JSON Lines tagged with the scan id", () => {
    const log = createDeadLinkDebugLog({ scanId: "scan-1" });

    log.append({ event: "scan_started" });
    log.append({ event: "request_started", url: "https://example.com/", attempt: 1 });

    const lines = parseLines(log.serialize());
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ scanId: "scan-1", event: "scan_started" });
    expect(lines[1]).toMatchObject({ event: "request_started", url: "https://example.com/" });
    expect(typeof lines[0].timestamp).toBe("string");
  });

  it("serializes an empty log as an empty string", () => {
    expect(createDeadLinkDebugLog({ scanId: "scan-1" }).serialize()).toBe("");
  });

  it("drops detail events past the size limit and says so", () => {
    const log = createDeadLinkDebugLog({ scanId: "scan-1", maxBytes: 400 });

    for (let attempt = 1; attempt <= 20; attempt++) {
      log.append({ event: "request_started", url: "https://example.com/", attempt });
    }

    const lines = parseLines(log.serialize());
    expect(log.droppedEvents).toBeGreaterThan(0);
    expect(lines[lines.length - 1]).toMatchObject({
      event: "log_truncated",
      droppedEvents: log.droppedEvents,
    });
  });

  it("keeps the final event even when the detail limit was reached", () => {
    const log = createDeadLinkDebugLog({ scanId: "scan-1", maxBytes: 200 });

    for (let attempt = 1; attempt <= 20; attempt++) {
      log.append({ event: "request_started", url: "https://example.com/", attempt });
    }
    log.append({ event: "scan_completed", totalUrls: 1, deadUrls: 1 });

    const lines = parseLines(log.serialize());
    expect(lines[lines.length - 1]).toMatchObject({ event: "scan_completed", deadUrls: 1 });
  });

  it("includes a scan that failed", () => {
    const log = createDeadLinkDebugLog({ scanId: "scan-1" });

    log.append({ event: "scan_failed", errorType: "Error" });

    expect(parseLines(log.serialize())).toEqual([
      expect.objectContaining({ event: "scan_failed", errorType: "Error" }),
    ]);
  });

  it("returns a snapshot that later events do not change", () => {
    const log = createDeadLinkDebugLog({ scanId: "scan-1" });
    log.append({ event: "scan_started" });

    const snapshot = log.serialize();
    log.append({ event: "urls_collected", totalUrls: 5 });

    expect(parseLines(snapshot)).toHaveLength(1);
    expect(parseLines(log.serialize())).toHaveLength(2);
  });
});
