import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageContent from "@/components/learn/PageContent";
import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { loadPageBySlug } from "@/domain/content/loadContent";
import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";

interface PageParams {
  readonly locale: AppLocale;
  readonly slug: string;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Generates metadata advertising hreflang alternates for a content page.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async route params including the slug segment.
 * @returns Metadata containing canonical and alternate-language links.
 */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;

  return { alternates: buildAlternateLanguages({ pathnameWithoutLocale: `/pages/${slug}` }) };
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

  const page = loadPageBySlug(slug);

  return <PageContent page={page} />;
};

export default ContentPage;
