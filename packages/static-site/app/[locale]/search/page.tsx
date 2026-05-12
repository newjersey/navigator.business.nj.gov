/**
 * Implements the locale-scoped search results route.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GovBanner } from "@/components/landing/GovBanner";
import { IdentifierSection } from "@/components/landing/IdentifierSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SkipNav } from "@/components/landing/SkipNav";
import { SearchResults } from "@/components/search/SearchResults";
import { hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { loadLandingContentFromMessages } from "@/domain/landing/loadLandingContent";

/**
 * Main content ID used by the search page skip link.
 */
const SEARCH_MAIN_CONTENT_ID = "search-main-content";

/**
 * Describes route params for search page rendering.
 */
interface SearchPageParams {
  /** Locale segment captured from the route. */
  readonly locale: string;
}

/**
 * Describes supported search query params.
 */
interface SearchPageSearchParams {
  /** Additional search params accepted by Next.js but ignored by this route. */
  readonly [key: string]: string | readonly string[] | undefined;
  /** Search query submitted through the `q` field. */
  readonly q?: string | readonly string[];
}

/**
 * Describes props accepted by the search page route component.
 */
interface SearchPageProps {
  /** Asynchronous route parameters provided by Next.js. */
  readonly params: Promise<SearchPageParams>;
  /** Asynchronous search parameters provided by Next.js. */
  readonly searchParams: Promise<SearchPageSearchParams>;
}

/**
 * Describes props accepted by search metadata generation.
 */
interface GenerateSearchMetadataProps {
  /** Asynchronous route parameters provided by Next.js. */
  readonly params: Promise<SearchPageParams>;
}

/**
 * Describes input for resolving the initial search query.
 */
interface ResolveInitialSearchQueryParams {
  /** Search params parsed from the incoming URL. */
  readonly searchParams: SearchPageSearchParams;
}

/**
 * Resolves the first submitted search query value.
 */
const resolveInitialSearchQuery = ({ searchParams }: ResolveInitialSearchQueryParams): string => {
  const query = searchParams.q;

  if (!query) {
    return "";
  }

  if (typeof query === "string") {
    return query;
  }

  return query[0] ?? "";
};

/**
 * Generates locale-specific search page metadata.
 *
 * @param props Metadata generation props.
 * @param props.params Async route params that include locale.
 * @returns Metadata with localized search title and description.
 * @throws Error from `notFound()` when the locale segment is unsupported.
 * @example
 * ```ts
 * const metadata = await generateMetadata({
 *   params: Promise.resolve({ locale: "en-US" }),
 * });
 * ```
 */
export const generateMetadata = async ({
  params,
}: GenerateSearchMetadataProps): Promise<Metadata> => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const applicationMessages = getApplicationMessages({ locale });

  return {
    title: applicationMessages.search.pageTitle,
    description: applicationMessages.search.pageDescription,
  };
};

/**
 * Renders the localized search results route.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async locale route params.
 * @param props.searchParams Async URL search params.
 * @returns The localized search page markup.
 * @throws Error from `notFound()` when the locale segment is unsupported.
 * @example
 * ```tsx
 * <SearchPage
 *   params={Promise.resolve({ locale: "en-US" })}
 *   searchParams={Promise.resolve({ q: "business" })}
 * />
 * ```
 */
const SearchPage = async ({ params, searchParams }: SearchPageProps) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const initialQuery = resolveInitialSearchQuery({ searchParams: resolvedSearchParams });
  const loadedLandingContent = await loadLandingContentFromMessages({ locale });
  const applicationMessages = getApplicationMessages({ locale });

  return (
    <div>
      <SkipNav
        label={loadedLandingContent.landing.skipNavigationLabel}
        mainContentId={SEARCH_MAIN_CONTENT_ID}
      />
      <GovBanner content={loadedLandingContent.landing.banner} />
      <SiteHeader content={loadedLandingContent.landing.header} locale={locale} />
      <main className="grid-container usa-section" id={SEARCH_MAIN_CONTENT_ID}>
        <div className="usa-prose">
          <h1>{applicationMessages.search.pageTitle}</h1>
          <p>{applicationMessages.search.pageDescription}</p>
        </div>
        <SearchResults content={applicationMessages.search} initialQuery={initialQuery} />
      </main>
      <SiteFooter
        content={loadedLandingContent.landing.footer}
        mainContentId={SEARCH_MAIN_CONTENT_ID}
      />
      <IdentifierSection content={loadedLandingContent.landing.identifier} />
    </div>
  );
};

export default SearchPage;
