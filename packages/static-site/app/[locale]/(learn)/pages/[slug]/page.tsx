import { notFound } from "next/navigation";
import PageContent from "@/components/learn/PageContent";
import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { loadPageBySlug } from "@/domain/content/loadContent";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";

interface PageParams {
  readonly locale: AppLocale;
  readonly slug: string;
}

interface Props {
  readonly params: Promise<PageParams>;
}

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
