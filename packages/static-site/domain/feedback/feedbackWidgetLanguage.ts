/**
 * Translates app locales into the language codes the NJ feedback widget uses.
 *
 * The widget ships copy for English and Spanish only, and identifies them by
 * bare language subtags rather than the full locale tags this app routes on.
 */

/**
 * Language codes the feedback widget recognizes.
 */
export type FeedbackWidgetLanguage = "en" | "es";

/**
 * Locale prefix that selects the widget's Spanish copy.
 */
const SPANISH_LANGUAGE_PREFIX = "es";

/**
 * Maps an app locale onto the widget's language code.
 *
 * Any locale the widget has no copy for falls back to English, which is the
 * widget's own default.
 *
 * @param locale Active locale tag, such as `en-US` or `es-US`.
 * @returns The language code to hand the widget.
 * @example
 * ```ts
 * toFeedbackWidgetLanguage("es-US"); // "es"
 * ```
 */
export const toFeedbackWidgetLanguage = (locale: string): FeedbackWidgetLanguage => {
  return locale.toLowerCase().startsWith(SPANISH_LANGUAGE_PREFIX) ? "es" : "en";
};
