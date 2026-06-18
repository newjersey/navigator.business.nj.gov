"use client";

/**
 * Detects a preferred-language mismatch and prompts the visitor to switch.
 *
 * On mount this molecule compares the visitor's browser languages against the
 * page's current locale. When a supported preferred locale differs from the
 * current one and the dismissal cookie is absent, it opens the NJWDS modal
 * offering to stay or switch. It never redirects automatically. The visitor's
 * choice is recorded in a dismissal cookie so they are not prompted again; the
 * switch action also persists `NEXT_LOCALE` and performs a full-page navigation
 * to the target locale.
 *
 * The entire dialog is shown in the preferred/target language so the visitor
 * — who may not read the current page's locale — can understand the prompt.
 */

import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { LANGUAGE_DESCRIPTORS } from "@/domain/i18n/languages";
import { addLocalePrefix, stripLocalePrefix } from "@/domain/i18n/localePath";
import { type AppLocale, resolveAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { usePathname } from "@/domain/i18n/navigation";
import { resolvePreferredLocale } from "@/domain/i18n/preferredLocale";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE, NEXT_LOCALE_COOKIE_NAME } from "@/domain/siteConfig";
import { LanguagePromptModalView } from "./LanguagePromptModalView";

/**
 * One year, in seconds, used as the dismissal cookie lifetime.
 */
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Reads the browser's ordered language preferences, if available.
 *
 * @returns Ordered browser language tags, or an empty list outside a browser.
 */
const readBrowserLanguages = (): readonly string[] => {
  if (typeof navigator === "undefined") {
    return [];
  }

  return navigator.languages ?? [];
};

/**
 * Checks whether the dismissal cookie is present.
 *
 * @returns `true` when the visitor already dismissed the prompt.
 */
const hasDismissalCookie = (): boolean => {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .some((entry) => entry.trim().startsWith(`${LANGUAGE_PROMPT_DISMISSED_COOKIE}=`));
};

/**
 * Writes a session-persistent cookie scoped to the whole site.
 *
 * @param name Cookie name to set.
 * @param value Cookie value to store.
 */
const writeCookie = (name: string, value: string): void => {
  // biome-ignore lint/suspicious/noDocumentCookie: a synchronous write is required here; the async Cookie Store API would let navigation race ahead of the cookie persisting.
  document.cookie = `${name}=${value}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
};

/**
 * Resolves the autonym for a locale from the descriptor table.
 *
 * @param locale Locale whose native name is needed.
 * @returns The locale's native name, or the locale tag as a fallback.
 */
const nativeNameOfLocale = (locale: AppLocale): string => {
  return (
    LANGUAGE_DESCRIPTORS.find((descriptor) => descriptor.locale === locale)?.nativeName ?? locale
  );
};

/**
 * Renders the preferred-language prompt when the browser language mismatches.
 *
 * @returns The prompt modal, or `null` when no prompt is warranted.
 * @example
 * ```tsx
 * <LanguagePromptModal />
 * ```
 */
export const LanguagePromptModal = () => {
  const currentLocale = resolveAppLocale({ locale: useLocale() });
  const pathname = usePathname();
  const openTriggerRef = useRef<HTMLButtonElement>(null);
  const [preferredLocale, setPreferredLocale] = useState<AppLocale | undefined>(undefined);

  useEffect(() => {
    if (hasDismissalCookie()) {
      return;
    }

    const preferred = resolvePreferredLocale({ browserLanguages: readBrowserLanguages() });

    if (preferred && preferred !== currentLocale) {
      setPreferredLocale(preferred);
    }
  }, [currentLocale]);

  useEffect(() => {
    if (preferredLocale) {
      openTriggerRef.current?.click();
    }
  }, [preferredLocale]);

  const handleStay = useCallback(() => {
    writeCookie(LANGUAGE_PROMPT_DISMISSED_COOKIE, "true");
  }, []);

  const handleRedirect = useCallback(() => {
    if (!preferredLocale) {
      return;
    }

    writeCookie(LANGUAGE_PROMPT_DISMISSED_COOKIE, "true");
    writeCookie(NEXT_LOCALE_COOKIE_NAME, preferredLocale);

    // Use a full-page navigation rather than a client-side router transition.
    // The open NJWDS modal hoists its DOM node out of React's tree into a
    // body-level wrapper; a client-side re-render then tries to unmount a node
    // React no longer owns, throwing a `removeChild` NotFoundError that trips
    // the framework error boundary.
    window.location.assign(
      addLocalePrefix({
        pathnameWithoutLocale: stripLocalePrefix(pathname),
        locale: preferredLocale,
      }),
    );
  }, [pathname, preferredLocale]);

  if (!preferredLocale) {
    return null;
  }

  // Show the entire dialog in the preferred language — the visitor may not read
  // the current page locale, so the prompt must speak to them in their language.
  const preferredContent = getApplicationMessages({ locale: preferredLocale }).layout
    .languagePrompt;
  const redirectLabel = preferredContent.redirectLabel.replace(
    "{language}",
    nativeNameOfLocale(preferredLocale),
  );

  return (
    <LanguagePromptModalView
      body={preferredContent.body}
      closeLabel={preferredContent.closeLabel}
      onRedirect={handleRedirect}
      onStay={handleStay}
      openTriggerRef={openTriggerRef}
      redirectLabel={redirectLabel}
      stayLabel={preferredContent.stayLabel}
      title={preferredContent.title}
    />
  );
};
