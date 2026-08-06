/**
 * Defines how the NJ feedback widget behaves in the current build.
 *
 * The widget's submission endpoint is a hardcoded constant inside the
 * published `@newjersey/feedback-widget` bundle with no override, so the only
 * way to keep non-production feedback out of the shared dataset is to stub the
 * network at the browser level. This module supplies the typed switch that
 * decides between real submissions, stubbed submissions, and no widget at all.
 */

/**
 * Base URL the feedback widget posts to.
 *
 * Hardcoded inside the published widget bundle as `API_URL`; mirrored here so
 * the mock transport can recognize which requests to intercept.
 */
export const FEEDBACK_API_BASE_URL = "https://innovation.nj.gov/app/feedback/dev";

/**
 * Behavior modes for the feedback widget.
 *
 * - `prod` renders the widget and lets it submit for real.
 * - `mock` renders the widget but stubs its network calls, so lower
 *   environments stay interactive without writing to the shared dataset.
 * - `off` does not render the widget at all.
 */
export type FeedbackWidgetMode = "prod" | "mock" | "off";

/**
 * Modes recognized from configuration, in their exact expected spelling.
 */
const RECOGNIZED_MODES: readonly FeedbackWidgetMode[] = ["prod", "mock", "off"];

/**
 * Checks whether an untrusted configuration value names a known mode.
 *
 * @param value Raw environment value to check.
 * @returns `true` when the value is exactly one of the recognized modes.
 */
const isFeedbackWidgetMode = (value: string): value is FeedbackWidgetMode => {
  return RECOGNIZED_MODES.includes(value as FeedbackWidgetMode);
};

/**
 * Reads the configured feedback widget mode.
 *
 * Unset and unrecognized values fall back to `off` so a misconfigured
 * environment fails closed rather than submitting real feedback by accident.
 *
 * @returns The mode configured for this build.
 * @example
 * ```ts
 * const mode = readFeedbackWidgetMode(); // "off" when unset
 * ```
 */
export const readFeedbackWidgetMode = (): FeedbackWidgetMode => {
  // biome-ignore lint/style/noProcessEnv: NEXT_PUBLIC_ vars are inlined at build time.
  const configuredMode = process.env.NEXT_PUBLIC_FEEDBACK_WIDGET_MODE ?? "";

  return isFeedbackWidgetMode(configuredMode) ? configuredMode : "off";
};
