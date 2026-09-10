/**
 * Renders `/search`: this app's pagefind search results page.
 *
 * A thin Server Component shell: it validates the locale, gates the whole
 * route behind `isSearchEnabled()` (the first route-level flag gate in this
 * app — every other flag-gated surface returns `null` from a component
 * instead), resolves `?q=`, and hands off to the Client Component that owns
 * the actual pagefind runtime and rendering (pagefind's JS runs in-browser).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SearchPageContent } from "@/components/search/SearchPageContent";
import { type AppLocale, hasAppLocale, resolveAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { buildPageMetadata } from "@/domain/metadata/pageMetadata";
import { isSearchEnabled } from "@/domain/search/searchFlag";

interface PageParams {
  readonly locale: AppLocale;
}

interface PageSearchParams {
  readonly q?: string;
}

interface Props {
  readonly params: Promise<PageParams>;
  readonly searchParams: Promise<PageSearchParams>;
}

/**
 * Generates branded, descriptive metadata for the search results page.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async route params including the locale segment.
 * @returns Metadata with a title matching the page's `<h1>`, its description, and alternate-language links.
 */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { locale } = await params;
  const { search } = getApplicationMessages({ locale: resolveAppLocale({ locale }) });

  return buildPageMetadata({
    pageTitle: search.title,
    description: search.metaDescription,
    pathnameWithoutLocale: "/search",
  });
};

const SearchRoute = async ({ params, searchParams }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale) || !isSearchEnabled()) {
    notFound();
  }

  const { q } = await searchParams;
  const { search } = getApplicationMessages({ locale });

  return <SearchPageContent initialQuery={q ?? ""} messages={search} />;
};

export default SearchRoute;
