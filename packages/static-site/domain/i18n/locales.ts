/**
 * Defines locale constants and helpers for the static-site package.
 *
 * This module is the single place where supported locale tags are listed and
 * validated. Route files and message loaders use these helpers to keep locale
 * behavior consistent across the app.
 */

/**
 * Lists every locale tag supported by this app.
 *
 * Keep this list short and explicit so routing and message loading stay easy
 * to reason about.
 */
export const APP_LOCALES = ["en-US", "es-US"] as const;

/**
 * Sets the fallback locale for missing or invalid locale input.
 *
 * The app uses this value whenever the incoming locale is not supported.
 */
export const DEFAULT_LOCALE: AppLocale = "en-US";

/**
 * Represents one valid locale tag in this app.
 *
 * This type is derived from `APP_LOCALES`, so it stays in sync with the
 * actual supported values.
 */
export type AppLocale = (typeof APP_LOCALES)[number];

/**
 * Describes the input used to resolve a route or request locale.
 *
 * The `locale` value can be missing when route parsing fails or when the
 * caller has not provided one yet.
 */
export interface ResolveAppLocaleParams {
  /** Locale value to resolve into a supported locale. */
  readonly locale: string | undefined;
}

/**
 * Checks whether a string is one of the supported locale tags.
 *
 * Use this type guard before passing a route value to APIs that require
 * an `AppLocale`.
 *
 * @param locale Locale candidate from routing or request state.
 * @returns `true` when `locale` is a supported `AppLocale`.
 * @example
 * ```ts
 * if (hasAppLocale(inputLocale)) {
 *   // inputLocale is narrowed to AppLocale here.
 * }
 * ```
 */
export const hasAppLocale = (locale: string): locale is AppLocale => {
  return APP_LOCALES.includes(locale as AppLocale);
};

/**
 * Resolves unknown locale input to a supported locale value.
 *
 * This helper keeps locale fallback behavior in one place so all callers use
 * the same defaulting rules.
 *
 * @param params Locale resolution input.
 * @param params.locale Locale candidate to validate.
 * @returns A supported locale tag. Falls back to `DEFAULT_LOCALE` when needed.
 * @example
 * ```ts
 * const locale = resolveAppLocale({ locale: "fr-FR" });
 * // locale === "en-US"
 * ```
 */
export const resolveAppLocale = ({ locale }: ResolveAppLocaleParams): AppLocale => {
  if (locale && hasAppLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
};
