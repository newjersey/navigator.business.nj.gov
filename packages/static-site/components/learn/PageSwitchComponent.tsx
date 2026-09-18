import type { ReactElement } from "react";
import { FundingPage } from "@/components/learn/FundingPage";
import { LicensingGuidePage } from "@/components/learn/LicensingGuidePage";
import PageContent from "@/components/learn/PageContent";
import { StarterKitsPage } from "@/components/learn/StarterKitsPage";
import type { PageItem } from "@/domain/content/types";
import type { AppLocale } from "@/domain/i18n/locales";

interface Props {
  readonly page: PageItem;
  readonly locale: AppLocale;
}

export const PageSwitchComponent = ({ page, locale }: Props): ReactElement => {
  switch (page.slug) {
    case "funding":
      return <FundingPage page={page} locale={locale} />;
    case "starter-kits":
      return <StarterKitsPage page={page} locale={locale} />;
    case "licensing-and-certification-guide":
      return <LicensingGuidePage page={page} locale={locale} />;
    default:
      return <PageContent page={page} />;
  }
};
