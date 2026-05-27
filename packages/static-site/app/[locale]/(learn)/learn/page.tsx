import { notFound } from "next/navigation";

import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface PageParams {
  readonly locale: AppLocale;
}

interface Props {
  readonly params: Promise<PageParams>;
}

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
