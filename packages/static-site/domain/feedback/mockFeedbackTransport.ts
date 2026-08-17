/**
 * Stubs the NJ feedback API so non-production builds stay interactive.
 *
 * The widget's submission URL is a hardcoded constant inside the published
 * bundle, so there is no configuration that points lower environments at a
 * throwaway backend. Intercepting `fetch` in the browser is the only seam
 * available, and mirrors the `mockFetch` helper NJWDS ships for its own
 * component documentation.
 */

import { FEEDBACK_API_BASE_URL } from "./feedbackWidgetMode";

const MOCK_SUCCESS_BODY = { message: "Success", feedbackId: 1 };

/**
 * Marks a patched `fetch` so repeated installs do not stack interceptors.
 */
const MOCK_TRANSPORT_FLAG = "__njFeedbackMockTransport";

type TaggedFetch = typeof fetch & { [MOCK_TRANSPORT_FLAG]?: true };

const resolveRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") {
    return input;
  }

  return input instanceof URL ? input.href : input.url;
};

const buildMockSuccessResponse = (): Response => {
  return new Response(JSON.stringify(MOCK_SUCCESS_BODY), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * Requests to any other host pass through untouched. Installing twice is a
 * no-op, so a re-render cannot stack interceptors.
 */
export const installMockFeedbackTransport = (): (() => void) => {
  const originalFetch = window.fetch as TaggedFetch;

  if (originalFetch[MOCK_TRANSPORT_FLAG] === true) {
    return () => {};
  }

  const mockFetch: TaggedFetch = async (input, init) => {
    if (resolveRequestUrl(input).startsWith(FEEDBACK_API_BASE_URL)) {
      return buildMockSuccessResponse();
    }

    return originalFetch(input, init);
  };

  mockFetch[MOCK_TRANSPORT_FLAG] = true;
  window.fetch = mockFetch;

  return () => {
    window.fetch = originalFetch;
  };
};
