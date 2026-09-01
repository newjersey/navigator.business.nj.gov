import FundingPageContent from "@/components/learn/FundingPageContent";
import { loadFundings, loadSectors } from "@/domain/content/loadContent";
import type { FundingPageMessages } from "@/domain/content/messageTypes";
import type { PageItem } from "@/domain/content/types";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface Props {
  readonly page: PageItem;
  readonly locale: AppLocale;
}

/**
 * Server component for the Housing Developer Resources page.
 *
 * Reuses `FundingPageContent`'s search, filter, pagination, and card
 * rendering, scoped to funding opportunities the content team has flagged
 * with `housingDeveloperResource`. Only the page title and CTA copy differ
 * from the general Funding page.
 */
export const HousingDeveloperResourcesPage = ({ page, locale }: Props) => {
  const fundings = loadFundings()
    .filter((funding) => funding.housingDeveloperResource === true)
    .sort((a, b) => a.name.localeCompare(b.name));
  const sectors = loadSectors();
  const { funding, housingDeveloperResources } = getApplicationMessages({ locale });
  const messages: FundingPageMessages = { ...funding, ...housingDeveloperResources };

  return (
    <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />
  );
};
