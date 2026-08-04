import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
 * Generates branded, descriptive metadata for the learn page.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async route params including the locale segment.
 * @returns Metadata with a title matching the page's `<h1>`, its description, and alternate-language links.
 */
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { locale } = await params;
  const { learn } = getApplicationMessages({ locale: resolveAppLocale({ locale }) });

  return buildPageMetadata({
    pageTitle: learn.name,
    description: learn.subHeadingText,
    pathnameWithoutLocale: "/learn",
  });
};

const LearnPage = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const { learn } = await getApplicationMessages({ locale });

  return (
    <>
      <h1>{learn.name}</h1>
      <p className="usa-intro">{learn.subHeadingText}</p>
      <h2>{learn.heading2}</h2>
      <ul className="usa-card-group">
        {learn.categories.map((category) => (
          <li key={category.title} className="usa-card tablet:grid-col-6">
            <div className="usa-card__container">
              <div className="usa-card__header">
                <h3 className="usa-card__heading">{category.title}</h3>
              </div>
              <div className="usa-card__body">
                <p>{category.subtitle}</p>
              </div>
              <div className="usa-card__footer">
                <a href={category.link.href} className="usa-button">
                  {learn.cardLinkText}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default LearnPage;
