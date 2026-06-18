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
 * Represents one valid locale tag in this app.
 *
 * This type is derived from `APP_LOCALES`, so it stays in sync with the
 * actual supported values.
 */
export type AppLocale = (typeof APP_LOCALES)[number];

/**
 * Sets the fallback locale for missing or invalid locale input.
 *
 * The app uses this value whenever the incoming locale is not supported.
 */
export const DEFAULT_LOCALE: AppLocale = "en-US";

/**
 * Describes input for computing the enabled locale subset.
 *
 * This type defines a stable shape for related data.
 */
export interface ComputeEnabledLocalesParams {
  /** Whether multilingual support is enabled for this build. */
  readonly multilingualEnabled: boolean;
}

/**
 * Returns the runtime-enabled locale subset for the given flag state.
 *
 * When multilingual is disabled, only the default locale is active so no
 * non-English routes or UI are generated. When enabled, all supported locales
 * are active and the full language-switching experience is available.
 *
 * @param params Input params.
 * @param params.multilingualEnabled Whether multilingual support is on.
 * @returns The enabled locale list for this build.
 * @example
 * ```ts
 * computeEnabledLocales({ multilingualEnabled: false }); // ["en-US"]
 * computeEnabledLocales({ multilingualEnabled: true });  // ["en-US", "es-US"]
 * ```
 */
export const computeEnabledLocales = ({
  multilingualEnabled,
}: ComputeEnabledLocalesParams): readonly AppLocale[] => {
  return multilingualEnabled ? APP_LOCALES : [DEFAULT_LOCALE];
};

const readMultilingualEnabled = (): boolean => {
  // biome-ignore lint/style/noProcessEnv: NEXT_PUBLIC_ vars are inlined at build time.
  return process.env.NEXT_PUBLIC_MULTILINGUAL_ENABLED === "true";
};

/**
 * The subset of locales active in this build.
 *
 * Equals `APP_LOCALES` when `NEXT_PUBLIC_MULTILINGUAL_ENABLED=true`; otherwise
 * contains only `DEFAULT_LOCALE`. All routing and UI components use this list
 * so that disabling the flag produces an English-only site with no non-English
 * routes generated or reachable.
 */
export const ENABLED_LOCALES: readonly AppLocale[] = computeEnabledLocales({
  multilingualEnabled: readMultilingualEnabled(),
});

/**
 * Checks whether a locale is active in this build.
 *
 * Use this guard to gate behavior that should only run for locales that are
 * enabled in the current build, rather than all supported locales.
 *
 * @param locale Locale candidate to check.
 * @returns `true` when the locale is in `ENABLED_LOCALES`.
 */
export const isLocaleEnabled = (locale: string): locale is AppLocale =>
  ENABLED_LOCALES.includes(locale as AppLocale);

/**
 * Returns `true` when more than one locale is active in this build.
 *
 * Use this to conditionally render language-switching UI — the switcher and
 * prompt modal are irrelevant when only one locale exists.
 *
 * @returns `true` when the multilingual flag is on.
 */
export const isMultilingualEnabled = (): boolean => ENABLED_LOCALES.length > 1;

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
