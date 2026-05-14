import { notFound } from "next/navigation";
import PageContent from "@/components/learn/PageContent";
import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { loadPageBySlug } from "@/domain/content/loadContent";
import { hasAppLocale } from "@/domain/i18n/locales";

interface PageParams {
  readonly locale: string;
  readonly category: string;
  readonly slug: string;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Returns the list of slug segments to pre-render at build time.
 *
 * Each object must include a `slug` key matching the `[slug]` segment
 * in the route. Next.js uses this to statically generate one page per slug.
 */
interface ParentParams {
  readonly category: string;
}

export const generateStaticParams = ({ params }: { params: ParentParams }) => {
  const children = CATEGORY_HIERARCHY[params.category]?.children ?? [];
  return children.map((page) => ({ slug: page.slug }));
};

const ContentPage = async ({ params }: Props) => {
  const { locale, slug } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const page = loadPageBySlug(slug);

  return (
    <>
      <PageContent page={page} />
    </>
  );
};

export default ContentPage;
