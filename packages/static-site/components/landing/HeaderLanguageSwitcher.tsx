"use client";

/**
 * Supplies live locale and pathname values to the language switcher atom.
 *
 * This thin client molecule isolates the `next-intl` hooks the stateless
 * `LanguageSwitcher` cannot call itself, then delegates all rendering to it.
 */

import { useLocale } from "next-intl";

import type { LayoutLanguageSwitcherContent } from "@/domain/content/messageTypes";
import { isMultilingualEnabled, resolveAppLocale } from "@/domain/i18n/locales";
import { usePathname } from "@/domain/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Describes props accepted by the header language switcher molecule.
 *
 * This type defines a stable shape for related data.
 */
export interface HeaderLanguageSwitcherProps {
  /** Localized switcher chrome shown in the current language. */
  readonly content: LayoutLanguageSwitcherContent;
}

/**
 * Renders the language switcher wired to the current locale and pathname.
 *
 * @param props Component props.
 * @param props.content Localized switcher chrome content.
 * @returns The language switcher for the header utility area.
 * @example
 * ```tsx
 * <HeaderLanguageSwitcher content={messages.layout.languageSwitcher} />
 * ```
 */
export const HeaderLanguageSwitcher = ({ content }: HeaderLanguageSwitcherProps) => {
  const pathname = usePathname();
  const currentLocale = resolveAppLocale({ locale: useLocale() });

  if (!isMultilingualEnabled()) {
    return null;
  }

  return (
    <LanguageSwitcher
      buttonLabel={content.buttonLabel}
      currentLanguageLabel={content.currentLanguageLabel}
      currentLocale={currentLocale}
      navigationAriaLabel={content.navigationAriaLabel}
      pathname={pathname}
    />
  );
};
