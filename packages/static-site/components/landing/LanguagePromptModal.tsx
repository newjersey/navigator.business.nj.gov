"use client";

/**
 * Detects a preferred-language mismatch and prompts the visitor to switch.
 *
 * On mount this molecule compares the visitor's browser languages against the
 * page's current locale. When a supported preferred locale differs from the
 * current one and the dismissal cookie is absent, it opens the NJWDS modal
 * offering to stay or switch. It never redirects automatically. The visitor's
 * choice is recorded in a dismissal cookie so they are not prompted again; the
 * switch action also persists `NEXT_LOCALE` via the next-intl router.
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
import { usePathname, useRouter } from "@/domain/i18n/navigation";
import { resolvePreferredLocale } from "@/domain/i18n/preferredLocale";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";
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
  const router = useRouter();
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

    const targetPathname = stripLocalePrefix(pathname);

    try {
      router.replace(targetPathname, { locale: preferredLocale });
    } catch {
      window.location.assign(
        addLocalePrefix({ pathnameWithoutLocale: targetPathname, locale: preferredLocale }),
      );
    }
  }, [pathname, preferredLocale, router]);

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
