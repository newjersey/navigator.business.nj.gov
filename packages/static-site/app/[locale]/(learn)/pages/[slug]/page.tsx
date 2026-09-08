import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageSwitchComponent } from "@/components/learn/PageSwitchComponent";
import { resolvePageTitle } from "@/components/learn/resolvePageTitle";
import { CATEGORY_HIERARCHY } from "@/domain/categories";
import {
  HOUSING_DEVELOPER_RESOURCES_SLUG,
  isHousingDeveloperResourcesEnabled,
} from "@/domain/content/housingDeveloperResourcesFlag";
import { loadPages } from "@/domain/content/loadContent";
import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { type AppLocale, hasAppLocale, resolveAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { buildPageMetadata } from "@/domain/metadata/pageMetadata";

interface PageParams {
  readonly locale: AppLocale;
  readonly slug: string;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Checks whether a slug is disabled by its own feature flag.
 *
 * A slug can exist in content but still be unreachable when its flag is off
 * — used to 404 the direct route even though `dynamicParams` would otherwise
 * let Next.js render an un-generated slug on demand.
 */
const isSlugFlaggedOff = (slug: string): boolean =>
  slug === HOUSING_DEVELOPER_RESOURCES_SLUG && !isHousingDeveloperResourcesEnabled();

/**
 * Generates branded, descriptive metadata for a content page.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async route params including the slug segment.
 * @returns Metadata with a title matching the page's `<h1>`, its description, and alternate-language links.
 */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { locale, slug } = await params;
  const pathnameWithoutLocale = `/pages/${slug}`;

  if (isSlugFlaggedOff(slug)) {
    return { alternates: buildAlternateLanguages({ pathnameWithoutLocale }) };
  }

  const page = loadPages().find((item) => item.slug === slug);
  if (!page) {
    return { alternates: buildAlternateLanguages({ pathnameWithoutLocale }) };
  }

  const messages = getApplicationMessages({ locale: resolveAppLocale({ locale }) });

  return buildPageMetadata({
    pageTitle: resolvePageTitle({ page, messages }),
    description: page["sub-heading-text"],
    pathnameWithoutLocale,
  });
};

export const generateStaticParams = () => {
  const allChildren = Object.values(CATEGORY_HIERARCHY).flatMap((category) => category.children);
  return allChildren.map((page) => ({ slug: page.slug }));
};

const ContentPage = async ({ params }: Props) => {
  const { locale, slug } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  if (isSlugFlaggedOff(slug)) {
    notFound();
  }

  const page = loadPages().find((item) => item.slug === slug);
  if (!page) {
    notFound();
  }

  return <PageSwitchComponent page={page} locale={locale} />;
};

export default ContentPage;
