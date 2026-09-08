"use client";

/**
 * Renders the sitewide header search entry point.
 *
 * A plain, native GET form: submitting navigates the browser directly to
 * `/search?q=...` with no client-side interception of the submit itself.
 * The `action` attribute is precomputed for the current locale via
 * `getPathname`, so the native submission still lands on the correct
 * locale-prefixed route without any JS driving the navigation.
 */

import { useLocale } from "next-intl";
import { Icon } from "@/components/Icon";
import type { LayoutHeaderContent } from "@/domain/content/messageTypes";
import { resolveAppLocale } from "@/domain/i18n/locales";
import { getPathname } from "@/domain/i18n/navigation";
import { isSearchEnabled } from "@/domain/search/searchFlag";

/**
 * Element id linking the visible label to the search input.
 */
const SEARCH_INPUT_ID = "header-search-field";

/**
 * Query param the results page (ticket 06) reads the search term from.
 */
const SEARCH_QUERY_PARAM = "q";

/**
 * Describes props accepted by the header search molecule.
 */
export interface HeaderSearchProps {
  /** Localized header chrome content, including the search form's copy. */
  readonly content: LayoutHeaderContent;
}

/**
 * Renders the header search form, gated behind the search feature flag.
 *
 * @param props Component props.
 * @param props.content Localized header chrome content.
 * @returns The search form, or `null` when the search flag is off.
 * @example
 * ```tsx
 * <HeaderSearch content={messages.layout.header} />
 * ```
 */
export const HeaderSearch = ({ content }: HeaderSearchProps) => {
  const currentLocale = resolveAppLocale({ locale: useLocale() });

  if (!isSearchEnabled()) {
    return null;
  }

  const action = getPathname({ href: content.searchAction, locale: currentLocale });

  return (
    <section aria-label={content.searchRegionLabel} className="nj-header-search">
      {/* Visually hidden rather than removed entirely: WCAG still expects a
          real accessible name, not a placeholder-only input (see
          `HeaderSearch.test.tsx`'s "accessible label, visually hidden"
          case) — `usa-sr-only` keeps it in the accessibility tree without
          taking up visible space. */}
      <label className="usa-sr-only" htmlFor={SEARCH_INPUT_ID}>
        {content.searchInputLabel}
      </label>
      {/* biome-ignore lint/a11y/useSemanticElements: NJWDS's compiled CSS keys the usa-search flex layout off the literal [role=search] attribute selector (public/assets/njwds/dist/css/styles.css); a bare <search> element (implicit role, no attribute) doesn't match it and breaks the layout. */}
      <form action={action} className="usa-search usa-search--small" role="search">
        <input className="usa-input" id={SEARCH_INPUT_ID} name={SEARCH_QUERY_PARAM} type="search" />
        <button className="usa-button" type="submit">
          <Icon iconName="search" label={content.searchSubmitIconAlt} />
        </button>
      </form>
    </section>
  );
};
