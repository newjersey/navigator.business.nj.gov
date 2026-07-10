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
            <WhatsNewCardElement recent={recent} key={recent.name} />
          ))}
        </ul>
        <div className="text-center margin-top-4">
          <LocalizedLink className="usa-button usa-button--outline" link={content.viewAllLink} />
        </div>
      </div>
    </section>
  );
};

const WhatsNewCardElement = (props: { recent: RecentItem }) => {
  return (
    <li key={props.recent.slug} className="usa-card tablet:grid-col-4 padding-x-1">
      <Link href={`/updates/${props.recent.slug}`}>
        <div className="usa-card__container">
          <div className="usa-card__header">
            {props.recent.topics && <span className="usa-tag">{props.recent.topics}</span>}
            <h3 className="usa-card__heading margin-top-1">{props.recent.name}</h3>
          </div>
          <div className="usa-card__body">
            {props.recent.date && <p className="text-base">{props.recent.date}</p>}
          </div>
        </div>
      </Link>
    </li>
  );
};
