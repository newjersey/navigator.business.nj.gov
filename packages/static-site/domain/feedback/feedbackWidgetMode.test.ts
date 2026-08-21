import { afterEach, describe, expect, it, vi } from "vitest";
import { readFeedbackWidgetMode } from "./feedbackWidgetMode";

describe("readFeedbackWidgetMode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns prod when the flag is exactly prod", () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "prod");

    expect(readFeedbackWidgetMode()).toBe("prod");
  });

  it("returns mock when the flag is exactly mock", () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "mock");

    expect(readFeedbackWidgetMode()).toBe("mock");
  });

  it("returns off when the flag is exactly off", () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "off");

    expect(readFeedbackWidgetMode()).toBe("off");
  });

  it("falls back to off when the flag is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "");

    expect(readFeedbackWidgetMode()).toBe("off");
  });

  it("falls back to off for unrecognized values", () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "enabled");

    expect(readFeedbackWidgetMode()).toBe("off");
  });

  it("does not treat differently cased values as enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_WIDGET_MODE", "PROD");

    expect(readFeedbackWidgetMode()).toBe("off");
  });
});
