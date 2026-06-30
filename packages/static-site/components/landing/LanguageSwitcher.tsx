/**
 * Renders the language switcher control for the site header.
 *
 * This component maps `LANGUAGE_DESCRIPTORS` into a USWDS `usa-language`
 * dropdown. A trigger button toggles a `usa-language__submenu` list.
 * Toggle, keyboard (Escape), and click-outside behavior are managed in React.
 *
 * Each submenu option follows the USWDS pattern:
 *   **Español** (Spanish)
 * — native name in bold, English name in parentheses — except for English
 * itself which appears without a parenthetical.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGE_DESCRIPTORS, type LanguageDescriptor } from "@/domain/i18n/languages";
import type { AppLocale } from "@/domain/i18n/locales";
import { Link } from "@/domain/i18n/navigation";

/**
 * Default element id linking the trigger button to the submenu list.
 *
 * Override via the `submenuId` prop when more than one switcher renders on a
 * page, so each trigger's `aria-controls` points at its own submenu.
 */
const DEFAULT_LANGUAGE_SUBMENU_ID = "language-switcher-submenu";

/**
 * Describes props accepted by the language switcher atom.
 *
 * This type defines a stable shape for related data.
 */
export interface LanguageSwitcherProps {
  /** Accessible label for the language navigation region. */
  readonly navigationAriaLabel: string;
  /** Label shown on the dropdown trigger button. */
  readonly buttonLabel: string;
  /** Visually-hidden suffix marking the active language option. */
  readonly currentLanguageLabel: string;
  /** Locale currently shown to the visitor. */
  readonly currentLocale: AppLocale;
  /** Current page pathname without a locale prefix, used as the link target. */
  readonly pathname: string;
  /**
   * Languages to offer, in display order. Defaults to the full app list;
   * accepts an override so tests can exercise specific option counts.
   */
  readonly descriptors?: readonly LanguageDescriptor[];
  /**
   * Element id linking the trigger to its submenu. Override when more than one
   * switcher appears on a page so each `aria-controls` stays unique.
   */
  readonly submenuId?: string;
}

/**
 * Describes input for rendering one language option in the submenu.
 *
 * This type defines a stable shape for related data.
 */
interface RenderLanguageOptionParams {
  /** Language metadata for the option. */
  readonly descriptor: LanguageDescriptor;
  /** Visually-hidden suffix marking the active language option. */
  readonly currentLanguageLabel: string;
  /** Locale currently shown to the visitor. */
  readonly currentLocale: AppLocale;
  /** Current page pathname without a locale prefix. */
  readonly pathname: string;
}

/**
 * Renders one selectable language option inside the dropdown submenu.
 *
 * @param params Render parameters.
 * @param params.descriptor Language metadata for the option.
 * @param params.currentLanguageLabel Visually-hidden active-state suffix.
 * @param params.currentLocale Locale currently shown to the visitor.
 * @param params.pathname Current page pathname without a locale prefix.
 * @returns One submenu list item.
 * @example
 * ```tsx
 * renderLanguageOption({ descriptor, currentLanguageLabel, currentLocale, pathname });
 * ```
 */
const renderLanguageOption = ({
  descriptor,
  currentLanguageLabel,
  currentLocale,
  pathname,
}: RenderLanguageOptionParams) => {
  const isCurrent = descriptor.locale === currentLocale;
  const isEnglish = descriptor.englishName === descriptor.nativeName;

  return (
    <li className="usa-language__submenu-item" key={descriptor.locale}>
      <Link
        aria-current={isCurrent ? "true" : undefined}
        href={pathname}
        hrefLang={descriptor.locale}
        locale={descriptor.locale}
      >
        {/* Per WCAG H58, only the native-name text is in a foreign language, so
            the lang attribute scopes to it rather than the whole link. */}
        <strong lang={descriptor.locale}>{descriptor.nativeName}</strong>
        {isEnglish ? null : ` (${descriptor.englishName})`}
        {isCurrent ? <span className="usa-sr-only">{` ${currentLanguageLabel}`}</span> : null}
      </Link>
    </li>
  );
};

/**
 * Renders the language switcher dropdown in the site header.
 *
 * @param props Component props.
 * @param props.navigationAriaLabel Accessible label for the nav region.
 * @param props.buttonLabel Label shown on the trigger button.
 * @param props.currentLanguageLabel Visually-hidden active-state suffix.
 * @param props.currentLocale Locale currently shown to the visitor.
 * @param props.pathname Current page pathname without a locale prefix.
 * @returns The language switcher nav with dropdown markup.
 * @example
 * ```tsx
 * <LanguageSwitcher
 *   navigationAriaLabel="Language"
 *   buttonLabel="Languages"
 *   currentLanguageLabel="Current language"
 *   currentLocale="en-US"
 *   pathname="/learn"
 * />
 * ```
 */
export const LanguageSwitcher = ({
  navigationAriaLabel,
  buttonLabel,
  currentLanguageLabel,
  currentLocale,
  pathname,
  descriptors = LANGUAGE_DESCRIPTORS,
  submenuId = DEFAULT_LANGUAGE_SUBMENU_ID,
}: LanguageSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav aria-label={navigationAriaLabel} className="usa-language">
      <ul className="usa-language__primary usa-list--unstyled">
        <li className="usa-language__primary-item" ref={containerRef}>
          <button
            aria-controls={submenuId}
            aria-expanded={isOpen}
            className="usa-button usa-button--outline usa-language__link"
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
          >
            {buttonLabel}
          </button>
          <ul
            className="usa-language__submenu nj-dropdown-inline-end"
            hidden={!isOpen || undefined}
            id={submenuId}
          >
            {descriptors.map((descriptor) => {
              return renderLanguageOption({
                descriptor,
                currentLanguageLabel,
                currentLocale,
                pathname,
              });
            })}
          </ul>
        </li>
      </ul>
    </nav>
  );
};
