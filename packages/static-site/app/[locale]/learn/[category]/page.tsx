import { notFound } from "next/navigation";
import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface PageParams {
  readonly locale: string;
  readonly category: string;
}

interface Props {
  readonly params: Promise<PageParams>;
}

/**
 * Returns the list of category segments to pre-render at build time.
 *
 * Each object must include a `category` key matching the `[category]` segment
 * in the route. Next.js uses this to statically generate one page per category.
 */
export const generateStaticParams = () => {
  return Object.keys(CATEGORY_HIERARCHY).map((category) => ({ category }));
};

const CategoryPage = async ({ params }: Props) => {
  const { locale, category } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const messages = getApplicationMessages({ locale });
  const currentPage = messages.learn.sideNav.pages.find((page) => page.key === category);

  if (!currentPage) {
    notFound();
  }

  return (
    <>
      <h1>{currentPage.label}</h1>
    </>
  );
};

export default CategoryPage;
