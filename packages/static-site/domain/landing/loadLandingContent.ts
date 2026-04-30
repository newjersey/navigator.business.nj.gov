/**
 * Loads typed landing-page content from localized message payloads.
 *
 * This module provides a small loader contract so route files can fetch
 * landing content without depending on message internals.
 */

import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import type { LandingMetadataContent, LandingPageContent } from "./types";

/**
 * Describes the input needed to load landing content for one locale.
 *
 * Use this parameter object instead of multiple positional arguments so the
 * call site stays readable as this loader evolves.
 */
export interface LoadLandingContentParams {
  /** Locale to load content for. */
  readonly locale: AppLocale;
}

/**
 * Represents the typed payload returned by a landing content loader.
 *
 * It includes both page section content and metadata strings used in the
 * document head.
 */
export interface LoadedLandingContent {
  /** Landing-page content used by stateless section components. */
  readonly landing: LandingPageContent;
  /** Localized metadata content for the document head. */
  readonly metadata: LandingMetadataContent;
}

/**
 * Defines the contract for any landing content loader implementation.
 *
 * Keep this type narrow so tests can inject a fake loader with no framework
 * dependencies.
 */
export type LandingContentLoader = (
  params: LoadLandingContentParams,
) => Promise<LoadedLandingContent>;

/**
 * Loads landing and metadata content from static JSON message files.
 *
 * The loader reads validated application messages and returns only the slices
 * needed by page rendering and metadata generation.
 *
 * @param params Locale lookup input.
 * @param params.locale Supported locale to load.
 * @returns Typed landing and metadata payload for the locale.
 * @example
 * ```ts
 * const loaded = await loadLandingContentFromMessages({ locale: "en-US" });
 * console.log(loaded.landing.hero.title);
 * ```
 */
export const loadLandingContentFromMessages: LandingContentLoader = async ({ locale }) => {
  const applicationMessages = getApplicationMessages({ locale });

  return {
    landing: applicationMessages.landing,
    metadata: applicationMessages.metadata,
  };
};
