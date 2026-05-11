/**
 * Loads typed learn-page content from localized message payloads.
 *
 * This module provides a small loader contract so route files can fetch
 * learn content without depending on message internals.
 */

import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import type { LearnPageContent } from "./types";

/**
 * Describes the input needed to load learn content for one locale.
 *
 * Use this parameter object instead of multiple positional arguments so the
 * call site stays readable as this loader evolves.
 */
export interface LoadLearnContentParams {
  /** Locale to load content for. */
  readonly locale: AppLocale;
}

/**
 * Represents the typed payload returned by a learn content loader.
 *
 * It includes page section content used in the learn route.
 */
export interface LoadedLearnContent {
  /** Learn-page content used by stateless section components. */
  readonly learn: LearnPageContent;
}

/**
 * Defines the contract for any learn content loader implementation.
 *
 * Keep this type narrow so tests can inject a fake loader with no framework
 * dependencies.
 */
export type LearnContentLoader = (params: LoadLearnContentParams) => Promise<LoadedLearnContent>;

/**
 * Loads learn-page content from static JSON message files.
 *
 * The loader reads validated application messages and returns only the slice
 * needed by page rendering.
 *
 * @param params Locale lookup input.
 * @param params.locale Supported locale to load.
 * @returns Typed learn payload for the locale.
 * @example
 * ```ts
 * const loaded = await loadLearnContentFromMessages({ locale: "en-US" });
 * console.log(loaded.learn.heading2);
 * ```
 */
export const loadLearnContentFromMessages: LearnContentLoader = async ({ locale }) => {
  const applicationMessages = getApplicationMessages({ locale });

  return {
    learn: applicationMessages.learn,
  };
};
