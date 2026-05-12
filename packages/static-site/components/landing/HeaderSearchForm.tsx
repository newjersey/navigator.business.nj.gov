/**
 * Renders the NJWDS header search form.
 *
 * The form submits a plain `q` query parameter to the locale-scoped search
 * page so it works without any client-side routing code.
 */

import Image from "next/image";

import type { AppLocale } from "@/domain/i18n/locales";
import type { LandingHeaderContent } from "@/domain/landing/types";

/**
 * Public path for the synced NJWDS search submit icon.
 */
const NJWDS_SEARCH_ICON_PATH = "/assets/njwds/dist/img/usa-icons-bg/search--white.svg";

/**
 * Describes props used by the header search form.
 */
export interface HeaderSearchFormProps {
  /** Header content containing search labels and the configured action path. */
  readonly header: LandingHeaderContent;
  /** Active locale used to build the form action URL. */
  readonly locale: AppLocale;
}

/**
 * Describes input for building the locale-scoped search action URL.
 */
interface BuildSearchActionParams {
  /** Active locale used as the first route segment. */
  readonly locale: AppLocale;
  /** Root-relative search action configured in localized messages. */
  readonly searchAction: string;
}

/**
 * Builds the locale-scoped search form action URL.
 *
 * @param params URL input.
 * @param params.locale Active locale used as the first route segment.
 * @param params.searchAction Root-relative search action path.
 * @returns Locale-prefixed search action path.
 * @example
 * ```ts
 * const action = buildSearchAction({ locale: "en-US", searchAction: "/search" });
 * ```
 */
const buildSearchAction = ({ locale, searchAction }: BuildSearchActionParams): string => {
  return `/${locale}${searchAction}`;
};

/**
 * Renders the header search form.
 *
 * @param props Component props.
 * @param props.header Header content containing search labels.
 * @param props.locale Active route locale.
 * @returns The NJWDS search form.
 * @example
 * ```tsx
 * <HeaderSearchForm header={content.header} locale="en-US" />
 * ```
 */
export const HeaderSearchForm = ({ header, locale }: HeaderSearchFormProps) => {
  const searchAction = buildSearchAction({ locale, searchAction: header.searchAction });

  return (
    <search>
      <form action={searchAction} className="usa-search usa-search--small">
        <label className="usa-sr-only" htmlFor="header-search-field">
          {header.searchInputLabel}
        </label>
        <input className="usa-input" id="header-search-field" name="q" type="search" />
        <button className="usa-button" type="submit">
          <Image
            alt={header.searchSubmitIconAlt}
            height={20}
            src={NJWDS_SEARCH_ICON_PATH}
            width={20}
          />
        </button>
      </form>
    </search>
  );
};
