/**
 * The widget ships copy for English and Spanish only, and identifies them by
 * bare language subtags rather than the full locale tags this app routes on.
 */
export type FeedbackWidgetLanguage = "en" | "es";

const SPANISH_LANGUAGE_PREFIX = "es";

/**
 * Any locale the widget has no copy for falls back to English, which is the
 * widget's own default.
 */
export const toFeedbackWidgetLanguage = (locale: string): FeedbackWidgetLanguage => {
  return locale.toLowerCase().startsWith(SPANISH_LANGUAGE_PREFIX) ? "es" : "en";
};
