import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ImpactReportPage } from "@/components/impactReport/ImpactReportPage";
import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";

interface PageParams {
  readonly locale: AppLocale;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Generates metadata advertising hreflang alternates for the impact report page.
 *
 * @returns Metadata containing canonical and alternate-language links.
 */
export const generateMetadata = (): Metadata => {
  return { alternates: buildAlternateLanguages({ pathnameWithoutLocale: "/impact-report" }) };
};

const ImpactReportRoute = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  return <ImpactReportPage locale={locale} />;
};

export default ImpactReportRoute;
