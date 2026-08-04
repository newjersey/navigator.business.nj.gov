import type { Metadata } from "next";
import { notFound } from "next/navigation";

import UpdateDetail from "@/components/learn/UpdateDetail";
import { loadRecents } from "@/domain/content/loadContent";
import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { buildUpdateDescription } from "@/domain/metadata/buildUpdateDescription";
import { buildPageMetadata } from "@/domain/metadata/pageMetadata";

interface PageParams {
  readonly locale: AppLocale;
  readonly slug: string;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Generates branded, descriptive metadata for an update's detail page.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async route params including the slug segment.
 * @returns Metadata with a title matching the update's `<h1>` and alternate-language links.
 */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const pathnameWithoutLocale = `/updates/${slug}`;

  const recent = loadRecents().find((item) => item.slug === slug);
  if (!recent) {
    return { alternates: buildAlternateLanguages({ pathnameWithoutLocale }) };
  }

  return buildPageMetadata({
    pageTitle: recent.name,
    description: buildUpdateDescription({ body: recent.body }),
    pathnameWithoutLocale,
  });
};

export const generateStaticParams = () => loadRecents().map((recent) => ({ slug: recent.slug }));

const UpdateDetailRoute = async ({ params }: Props) => {
  const { locale, slug } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const recent = loadRecents().find((item) => item.slug === slug);
  if (!recent) {
    notFound();
  }

  const { updates: messages } = getApplicationMessages({ locale });

  return <UpdateDetail recent={recent} messages={messages} />;
};

export default UpdateDetailRoute;
