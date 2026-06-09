import Image from "next/image";

import type { QuickServicesContent, QuickServicesItem } from "@/domain/content/messageTypes";
import { LocalizedLink } from "./LocalizedLink";

export interface QuickServicesSectionProps {
  readonly content: QuickServicesContent;
}

export const QuickServicesSection = ({ content }: QuickServicesSectionProps) => {
  return (
    <section className="usa-section">
      <div className="grid-container">
        <h2 className="font-heading-2xl dark-blue">{content.title}</h2>
        <p className="margin-bottom-5">{content.subtitle}</p>
        <div className="grid-row grid-gap">
          {content.items.map((item) => (
            <QuickServiceCard item={item} key={item.title} />
          ))}
        </div>
      </div>
    </section>
  );
};

const QuickServiceCard = (props: { item: QuickServicesItem }) => {
  return (
    <div className="grid-col-12 tablet:grid-col-6 desktop:grid-col-4 margin-bottom-2">
      <LocalizedLink className="card quick-service-card" link={props.item.link}>
        <div className="quick-service-card__icon">
          <Image src={props.item.iconPath} alt={props.item.iconAlt} width={48} height={48} />
        </div>
        <div>
          <h3 className="card__title">{props.item.title}</h3>
          <p className="card__description">{props.item.description}</p>
        </div>
      </LocalizedLink>
    </div>
  );
};
