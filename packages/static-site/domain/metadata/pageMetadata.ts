/**
 * Builds complete, per-page metadata for App Router routes.
 *
 * Next.js's `title.template` mechanism only rewrites the plain `title` field —
 * `openGraph.title` and `twitter.title` are resolved from their own,
 * independent template slots (see `resolve-metadata.js`), so a layout-level
 * template silently leaves `og:title`/`twitter:title` on the generic parent
 * value unless every child route restates it. This helper sidesteps that by
 * returning a fully composed, `absolute` title for all three surfaces in one
 * call, so a route can never brand its `<title>` without also branding its
 * social preview.
 */

import type { Metadata } from "next";

import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { SITE_TITLE_SUFFIX, SOCIAL_PREVIEW_IMAGE } from "@/domain/siteConfig";

/**
 * Describes input for building a page's metadata.
 *
 * This type defines a stable shape for related data.
 */
export interface BuildPageMetadataParams {
  /** Bare, unbranded page title — normally the page's own `<h1>` text. */
  readonly pageTitle: string;
  /** Page pathname without any locale prefix, starting with `/`. */
  readonly pathnameWithoutLocale: string;
  /** Page description. Omit to inherit the site-wide description from the locale layout. */
  readonly description?: string;
}

/**
 * Builds branded title, description, social preview, and hreflang metadata for a page.
 *
 * The returned title is an `absolute` string, so it cannot be re-templated by
 * an ancestor layout — the brand suffix is applied exactly once, here.
 *
 * @param params Build input.
 * @param params.pageTitle Bare, unbranded page title.
 * @param params.pathnameWithoutLocale Unprefixed page pathname.
 * @param params.description Page description; omitted keys inherit the layout default.
 * @returns Metadata with a branded title, matching Open Graph and Twitter titles, and alternates.
 * @example
 * ```ts
 * buildPageMetadata({ pageTitle: "Government Contracting", pathnameWithoutLocale: "/pages/government-contracting" });
 * // { title: { absolute: "Government Contracting | Business.NJ.gov" }, ... }
 * ```
 */
export const buildPageMetadata = ({
  pageTitle,
  pathnameWithoutLocale,
  description,
}: BuildPageMetadataParams): Metadata => {
  const brandedTitle = `${pageTitle} | ${SITE_TITLE_SUFFIX}`;
  const trimmedDescription = description?.trim();
  const descriptionFields = trimmedDescription ? { description: trimmedDescription } : {};

  return {
    title: { absolute: brandedTitle },
    ...descriptionFields,
    alternates: buildAlternateLanguages({ pathnameWithoutLocale }),
    openGraph: {
      title: { absolute: brandedTitle },
      ...descriptionFields,
      images: [SOCIAL_PREVIEW_IMAGE],
    },
    twitter: {
      card: "summary",
      title: { absolute: brandedTitle },
      ...descriptionFields,
      images: [SOCIAL_PREVIEW_IMAGE.url],
    },
  };
};
