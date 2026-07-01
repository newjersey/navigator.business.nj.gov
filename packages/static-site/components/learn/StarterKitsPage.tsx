import { IndustrySelector } from "@/components/learn/IndustrySelector";
import { loadIndustries } from "@/domain/content/loadContent";
import type { PageItem } from "@/domain/content/types";
import { ACCOUNT_APP_URL } from "@/domain/env";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

const ONBOARDING_URL = `${ACCOUNT_APP_URL}/onboarding`;

const buildOnboardingHref = (industryId: string): string => {
  const url = new URL(ONBOARDING_URL);
  url.searchParams.set("industry", industryId);
  return url.toString();
};

interface Props {
  readonly page: PageItem;
  readonly locale: AppLocale;
}

export const StarterKitsPage = async ({ page, locale }: Props) => {
  const industries = loadIndustries()
    .filter((i) => i.id !== "generic")
    .map((i) => ({ id: i.id, name: i.name }));
  const messages = await getApplicationMessages({ locale });
  const starterKitsContent = messages.learn.starterKits;

  return (
    <article>
      <h1>{page.name}</h1>
      {page["sub-heading-text"] && <p className="usa-intro">{page["sub-heading-text"]}</p>}

      <h2>{page["heading-2"]}</h2>
      {page["main-text-2"] && <p>{page["main-text-2"]}</p>}

      <IndustrySelector
        industries={industries}
        baseUrl={ONBOARDING_URL}
        heading={starterKitsContent.industrySelectorHeading}
        ctaText={starterKitsContent.industrySelectorCta}
      />

      <h2 className="margin-top-6">{starterKitsContent.topIndustriesHeading}</h2>
      <ul className="usa-card-group">
        {starterKitsContent.topIndustries.map((industry) => (
          <li key={industry.id} className="usa-card tablet:grid-col-6">
            <div className="usa-card__container">
              <div className="usa-card__body">
                <h3>{industry.name}</h3>
                <p>{industry.description}</p>
                <a href={buildOnboardingHref(industry.id)}>{industry.ctaText}</a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
