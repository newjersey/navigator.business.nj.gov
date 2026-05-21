import { notFound } from "next/navigation";
import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface PageParams {
  readonly locale: AppLocale;
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
    return notFound();
  }

  const messages = getApplicationMessages({ locale });
  const currentCategoryContent = messages.learn.categories.find(
    (content) => content.key === category,
  );
  const subpages = CATEGORY_HIERARCHY[category].children.filter(
    (subpage) => subpage.hideFromCategoryPage !== true,
  );

  if (!currentCategoryContent) {
    return notFound();
  }

  return (
    <>
      <h1>{currentCategoryContent.title}</h1>
      <p className="usa-intro">{currentCategoryContent.subtitle}</p>
      <h2 className="margin-top-6">{messages.learn.categoryPages.allTopics}</h2>
      <ul className="usa-list--unstyled">
        {subpages.map((subpage) => (
          <li key={subpage.slug}>
            <strong>
              <a href={`/learn/${category}/${subpage.slug}`}>{subpage.name}</a>
            </strong>
            <p>{subpage["sub-heading-text"]}</p>
            <hr className="margin-y-2" />
          </li>
        ))}
      </ul>
    </>
  );
};

export default CategoryPage;
