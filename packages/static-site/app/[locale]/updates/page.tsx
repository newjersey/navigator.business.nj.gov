import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UpdatesPage } from "@/components/learn/UpdatesPage";
import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";

interface PageParams {
  readonly locale: AppLocale;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Generates metadata advertising hreflang alternates for the updates page.
 *
 * @returns Metadata containing canonical and alternate-language links.
 */
export const generateMetadata = (): Metadata => {
  return { alternates: buildAlternateLanguages({ pathnameWithoutLocale: "/updates" }) };
};

const UpdatesRoute = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  return <UpdatesPage locale={locale} />;
};

export default UpdatesRoute;
