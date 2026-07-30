/**
 * Implements the standalone "Terms & Privacy Policy" page route.
 *
 * The page renders the same Markdown content as other guidance pages but lives
 * outside the `(learn)` route group, so it stands on its own without the
 * Plan/Start/Operate/Grow side navigation. Its Markdown source is loaded by
 * slug and rendered through the shared `PageContent` renderer.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageContent from "@/components/learn/PageContent";
import { loadPages } from "@/domain/content/loadContent";
import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";

/**
 * Slug of the Markdown file backing this page (`content/src/pages/<slug>.md`).
 */
const PAGE_SLUG = "privacy-policy";

interface PageParams {
  readonly locale: AppLocale;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Generates metadata advertising hreflang alternates for the page.
 *
 * @returns Metadata containing canonical and alternate-language links.
 */
export const generateMetadata = (): Metadata => {
  return { alternates: buildAlternateLanguages({ pathnameWithoutLocale: `/${PAGE_SLUG}` }) };
};

const PrivacyPolicyRoute = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const page = loadPages().find((item) => item.slug === PAGE_SLUG);
  if (!page) {
    notFound();
  }

  return (
    <div className="grid-container usa-section">
      <PageContent page={page} />
    </div>
  );
};

export default PrivacyPolicyRoute;
