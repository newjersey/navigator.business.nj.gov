import type { WhatsNewContent } from "@/domain/content/messageTypes";
import type { RecentItem } from "@/domain/content/types";
import { Link } from "@/domain/i18n/navigation";
import { LocalizedLink } from "./LocalizedLink";

export interface WhatsNewSectionProps {
  readonly content: WhatsNewContent;
  readonly recents: RecentItem[];
}

export const WhatsNewSection = ({ content, recents }: WhatsNewSectionProps) => {
  if (recents.length === 0) {
    return null;
  }

  return (
    <section className="usa-section">
      <div className="grid-container">
        <h2 className="font-heading-2xl dark-blue">{content.title}</h2>
        <ul className="usa-card-group">
          {recents.map((recent) => (
            <li key={recent.slug} className="usa-card tablet:grid-col-4">
              <Link href={`/recent/${recent.slug}`}>
                <div className="usa-card__container">
                  <div className="usa-card__header">
                    {recent.topics && <span className="usa-tag">{recent.topics}</span>}
                    <h3 className="usa-card__heading margin-top-1">{recent.name}</h3>
                  </div>
                  <div className="usa-card__body">
                    {recent.date && <p className="text-base">{recent.date}</p>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="text-center margin-top-4">
          <LocalizedLink className="usa-button usa-button--outline" link={content.viewAllLink} />
        </div>
      </div>
    </section>
  );
};
