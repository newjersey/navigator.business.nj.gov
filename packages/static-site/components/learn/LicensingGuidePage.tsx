import LicensingGuidePageContent from "@/components/learn/LicensingGuidePageContent";
import { loadLicenses } from "@/domain/content/loadContent";
import type { PageItem } from "@/domain/content/types";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface Props {
  readonly page: PageItem;
  readonly locale: AppLocale;
}

export const LicensingGuidePage = ({ page, locale }: Props) => {
  const licenses = loadLicenses().sort((a, b) => a.name.localeCompare(b.name));
  const { licensingGuide: messages } = getApplicationMessages({ locale });

  return <LicensingGuidePageContent messages={messages} page={page} licenses={licenses} />;
};
