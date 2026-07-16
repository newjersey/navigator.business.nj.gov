import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsletterSignupPage } from "@/components/newsletterSignup/NewsletterSignupPage";
import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";

interface PageParams {
  readonly locale: AppLocale;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Generates metadata advertising hreflang alternates for the newsletter signup page.
 *
 * @returns Metadata containing canonical and alternate-language links.
 */
export const generateMetadata = (): Metadata => {
  return { alternates: buildAlternateLanguages({ pathnameWithoutLocale: "/newsletter-signup" }) };
};

const NewsletterSignupRoute = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  return <NewsletterSignupPage locale={locale} />;
};

export default NewsletterSignupRoute;
