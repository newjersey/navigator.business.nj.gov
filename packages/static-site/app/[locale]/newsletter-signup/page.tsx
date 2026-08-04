import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsletterSignupPage } from "@/components/newsletterSignup/NewsletterSignupPage";
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
 * Generates branded, descriptive metadata for the newsletter signup page.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async route params including the locale segment.
 * @returns Metadata with a title matching the page's `<h1>`, its description, and alternate-language links.
 */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { locale } = await params;
  const { newsletterSignup } = getApplicationMessages({ locale: resolveAppLocale({ locale }) });

  return buildPageMetadata({
    pageTitle: newsletterSignup.title,
    description: newsletterSignup.metaDescription,
    pathnameWithoutLocale: "/newsletter-signup",
  });
};

const NewsletterSignupRoute = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  return <NewsletterSignupPage locale={locale} />;
};

export default NewsletterSignupRoute;
