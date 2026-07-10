import UpdatesPageContent from "@/components/learn/UpdatesPageContent";
import { loadRecents } from "@/domain/content/loadContent";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface Props {
  readonly locale: AppLocale;
}

export const UpdatesPage = ({ locale }: Props) => {
  const recents = loadRecents();
  const { updates: messages } = getApplicationMessages({ locale });

  return (
    <div className="grid-container usa-section">
      <UpdatesPageContent messages={messages} recents={recents} />
    </div>
  );
};
