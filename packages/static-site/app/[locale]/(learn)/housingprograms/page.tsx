/**
 * Implements the Housing Developer Resources route at `/housingprograms`.
 *
 * The page lives inside the `(learn)` route group, so its layout (the
 * Plan/Start/Operate/Grow side navigation and the page wrapper) comes from
 * `app/[locale]/(learn)/layout.tsx` and must not be repeated here. It is served
 * by this dedicated route rather than `/pages/[slug]`, so that slug 404s there.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HousingDeveloperResourcesPage } from "@/components/learn/HousingDeveloperResourcesPage";
import { resolvePageTitle } from "@/components/learn/resolvePageTitle";
import {
  HOUSING_DEVELOPER_RESOURCES_PATHNAME,
  HOUSING_DEVELOPER_RESOURCES_SLUG,
  isHousingDeveloperResourcesEnabled,
} from "@/domain/content/housingDeveloperResourcesFlag";
import { loadPageBySlug } from "@/domain/content/loadContent";
import { type AppLocale, hasAppLocale, resolveAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { buildPageMetadata } from "@/domain/metadata/pageMetadata";

interface PageParams {
  readonly locale: AppLocale;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Generates branded, descriptive metadata for the page.
 *
 * Deliberately not gated on the feature flag: the flag gates whether the route
 * renders, and a flagged-off request 404s, which serves `not-found.tsx`'s
 * metadata instead of this.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async route params including the locale segment.
 * @returns Metadata with a title matching the page's `<h1>`, its description, and alternate-language links.
 */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { locale } = await params;
  const page = loadPageBySlug(HOUSING_DEVELOPER_RESOURCES_SLUG);
  const messages = getApplicationMessages({ locale: resolveAppLocale({ locale }) });

  return buildPageMetadata({
    pageTitle: resolvePageTitle({ page, messages }),
    description: page["sub-heading-text"],
    pathnameWithoutLocale: HOUSING_DEVELOPER_RESOURCES_PATHNAME,
  });
};

const HousingProgramsRoute = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  if (!isHousingDeveloperResourcesEnabled()) {
    notFound();
  }

  const page = loadPageBySlug(HOUSING_DEVELOPER_RESOURCES_SLUG);

  return <HousingDeveloperResourcesPage page={page} locale={locale} />;
};

export default HousingProgramsRoute;
