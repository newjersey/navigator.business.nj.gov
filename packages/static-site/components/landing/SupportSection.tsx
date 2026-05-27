import Image from "next/image";
import Markdown from "react-markdown";
import type { SupportCard, SupportSectionContent } from "@/domain/content/messageTypes";
import { LocalizedLink } from "./LocalizedLink";

export interface SupportSectionProps {
  readonly content: SupportSectionContent;
}

export const SupportSection = ({ content }: SupportSectionProps) => {
  return (
    <section className="usa-section">
      <div className="grid-container">
        <h2 className="font-heading-xl">{content.title}</h2>
        <Markdown>{content.description}</Markdown>
        <div className="grid-row grid-gap">
          {content.cards.map((card) => (
            <SupportCardElement card={card} key={card.title} />
          ))}
        </div>
      </div>
    </section>
  );
};

const SupportCardElement = (props: { card: SupportCard }) => {
  return (
    <div className="tablet:grid-col-4 margin-bottom-2">
      <LocalizedLink className="card support-card" link={props.card.link}>
        <div className="support-card__icon">
          <Image src={props.card.iconPath} alt={props.card.iconAlt} width={80} height={80} />
        </div>
        <h3 className="card__title">{props.card.title}</h3>
        <p className="card__description">{props.card.description}</p>
      </LocalizedLink>
    </div>
  );
};
