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
          {content.items.map((item, index) => (
            <QuickServiceCard
              descriptionId={`quick-service-description-${index}`}
              item={item}
              key={item.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface QuickServiceCardProps {
  readonly descriptionId: string;
  readonly item: QuickServicesItem;
}

const QuickServiceCard = ({ descriptionId, item }: QuickServiceCardProps) => {
  return (
    <div className="grid-col-12 tablet:grid-col-6 desktop:grid-col-4 margin-bottom-2">
      <div className="card quick-service-card">
        <div className="quick-service-card__icon">
          <Image src={item.iconPath} alt={item.iconAlt} width={48} height={48} />
        </div>
        <div>
          <h3 className="card__title">
            <LocalizedLink
              ariaDescribedBy={descriptionId}
              className="quick-service-card__link"
              link={item.link}
            >
              {item.title}
            </LocalizedLink>
          </h3>
          <p className="card__description" id={descriptionId}>
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};
