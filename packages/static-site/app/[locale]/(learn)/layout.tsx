import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { LearnSideNav } from "@/components/learn/LearnSideNav";
import { CATEGORY_HIERARCHY } from "@/domain/categories";
import { hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

/**
 * Describes route params for locale-scoped pages.
 *
 * This type defines a stable shape for related data.
 */
export interface RouteParams {
  /** Locale segment captured from the route. */
  readonly locale: string;
}

interface PageLayoutProps {
  /** Child route content rendered within the locale shell. */
  readonly children: ReactNode;
  /** Asynchronous route parameters provided by Next.js. */
  readonly params: Promise<RouteParams>;
}

const PageLayout = async ({ children, params }: PageLayoutProps) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const messages = await getApplicationMessages({ locale });

  const introductionLabel = messages.learn.sideNav.learnCategory.title;

  const categoryChildren = Object.fromEntries(
    messages.learn.categories.map((category) => {
      const pages = (CATEGORY_HIERARCHY[category.key]?.children ?? [])
        .filter((page) => page.hideFromCategoryPage !== "true")
        .map((page) => ({
          link: {
            label: page.name,
            href: `/pages/${page.slug}`,
            isInternal: true,
            opensInNewTab: false,
          },
        }));

      const introItem = {
        link: {
          label: introductionLabel,
          href: category.link.href,
          isInternal: true,
          opensInNewTab: false,
        },
      };

      return [category.key, [introItem, ...pages]];
    }),
  );

  return (
    // A `div`, not `main`: the app shell (locale layout) already provides the
    // top-level `<main>` landmark, so this inner wrapper must not be a second one.
    <div className="grid-container usa-section">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-4 learn-side-nav">
          <LearnSideNav content={messages.learn} categoryChildren={categoryChildren} />
        </div>
        <div className="tablet:grid-col-8">{children}</div>
      </div>
    </div>
  );
};

/**
 * Exports the locale layout for Next.js app routing.
 */
export default PageLayout;
