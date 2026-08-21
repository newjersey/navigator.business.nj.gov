import { afterEach, describe, expect, it, vi } from "vitest";
import { FEEDBACK_API_BASE_URL } from "./feedbackWidgetMode";
import { installMockFeedbackTransport } from "./mockFeedbackTransport";

describe("installMockFeedbackTransport", () => {
  const originalFetch = window.fetch;

  afterEach(() => {
    window.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("resolves feedback rating requests without hitting the network", async () => {
    const realFetch = vi.fn();
    window.fetch = realFetch;
    installMockFeedbackTransport();

    const response = await window.fetch(`${FEEDBACK_API_BASE_URL}/rating`, {
      method: "POST",
      body: JSON.stringify({ pageURL: "example.com", rating: "true" }),
    });

    expect(realFetch).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "Success", feedbackId: 1 });
  });

  it("intercepts the comment and email endpoints too", async () => {
    const realFetch = vi.fn();
    window.fetch = realFetch;
    installMockFeedbackTransport();

    const commentResponse = await window.fetch(`${FEEDBACK_API_BASE_URL}/comment`, {
      method: "POST",
    });
    const emailResponse = await window.fetch(`${FEEDBACK_API_BASE_URL}/email`, {
      method: "POST",
    });

    expect(realFetch).not.toHaveBeenCalled();
    await expect(commentResponse.json()).resolves.toEqual({
      message: "Success",
      feedbackId: 1,
    });
    await expect(emailResponse.json()).resolves.toEqual({
      message: "Success",
      feedbackId: 1,
    });
  });

  it("passes unrelated requests through to the original fetch", async () => {
    const realFetch = vi.fn().mockResolvedValue(new Response("ok"));
    window.fetch = realFetch;
    installMockFeedbackTransport();

    await window.fetch("https://example.com/data");

    expect(realFetch).toHaveBeenCalledTimes(1);
  });

  it("restores the original fetch on teardown", () => {
    const realFetch = vi.fn();
    window.fetch = realFetch;

    const teardown = installMockFeedbackTransport();
    teardown();

    expect(window.fetch).toBe(realFetch);
  });

  it("does not double-wrap when installed twice", async () => {
    const realFetch = vi.fn().mockResolvedValue(new Response("ok"));
    window.fetch = realFetch;

    const firstTeardown = installMockFeedbackTransport();
    const secondTeardown = installMockFeedbackTransport();
    secondTeardown();
    firstTeardown();

    expect(window.fetch).toBe(realFetch);
  });

  it("accepts Request objects as well as string URLs", async () => {
    const realFetch = vi.fn();
    window.fetch = realFetch;
    installMockFeedbackTransport();

    const response = await window.fetch(new Request(`${FEEDBACK_API_BASE_URL}/rating`));

    expect(realFetch).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});
