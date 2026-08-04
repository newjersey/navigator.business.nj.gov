import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ImpactReportPage } from "@/components/impactReport/ImpactReportPage";
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
 * Generates branded, descriptive metadata for the impact report page.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async route params including the locale segment.
 * @returns Metadata with a title matching the page's `<h1>`, its description, and alternate-language links.
 */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { locale } = await params;
  const { impactReport } = getApplicationMessages({ locale: resolveAppLocale({ locale }) });

  return buildPageMetadata({
    pageTitle: impactReport.title,
    description: impactReport.metaDescription,
    pathnameWithoutLocale: "/impact-report",
  });
};

const ImpactReportRoute = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  return <ImpactReportPage locale={locale} />;
};

export default ImpactReportRoute;
