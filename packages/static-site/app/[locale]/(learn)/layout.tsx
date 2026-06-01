import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { LearnSideNav } from "@/components/learn/LearnSideNav";
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

  return (
    <main className="grid-container usa-section">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-4 learn-side-nav">
          <LearnSideNav content={messages.learn} />
        </div>
        <div className="tablet:grid-col-8">{children}</div>
      </div>
    </main>
  );
};

/**
 * Exports the locale layout for Next.js app routing.
 */
export default PageLayout;
