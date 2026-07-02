import FundingPageContent from "@/components/learn/FundingPageContent";
import { loadFundings, loadSectors } from "@/domain/content/loadContent";
import type { PageItem } from "@/domain/content/types";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface Props {
  readonly page: PageItem;
  readonly locale: AppLocale;
}

export const FundingPage = ({ page, locale }: Props) => {
  const fundings = loadFundings().sort((a, b) => a.name.localeCompare(b.name));
  const sectors = loadSectors();
  const { funding: messages } = getApplicationMessages({ locale });

  return (
    <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />
  );
};
