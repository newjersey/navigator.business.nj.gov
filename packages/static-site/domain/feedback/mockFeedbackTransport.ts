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

/**
 * Canned success body the real API returns for an accepted submission.
 */
const MOCK_SUCCESS_BODY = { message: "Success", feedbackId: 1 };

/**
 * Marks a patched `fetch` so repeated installs do not stack interceptors.
 */
const MOCK_TRANSPORT_FLAG = "__njFeedbackMockTransport";

/**
 * A `fetch` implementation tagged with the mock-transport marker.
 */
type TaggedFetch = typeof fetch & { [MOCK_TRANSPORT_FLAG]?: true };

/**
 * Extracts the target URL from any of `fetch`'s accepted input shapes.
 *
 * @param input Value passed as `fetch`'s first argument.
 * @returns The request URL as a string.
 */
const resolveRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") {
    return input;
  }

  return input instanceof URL ? input.href : input.url;
};

/**
 * Builds the stubbed success response for an intercepted submission.
 *
 * @returns A JSON response matching the real API's success payload.
 */
const buildMockSuccessResponse = (): Response => {
  return new Response(JSON.stringify(MOCK_SUCCESS_BODY), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * Intercepts feedback submissions and resolves them locally.
 *
 * Requests to any other host pass through untouched. Installing twice is a
 * no-op, so a re-render cannot stack interceptors.
 *
 * @returns A teardown function restoring the previous `fetch`.
 * @example
 * ```ts
 * const teardown = installMockFeedbackTransport();
 * teardown();
 * ```
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
