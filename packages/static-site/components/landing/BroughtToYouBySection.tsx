import type { BroughtToYouByContent } from "@/domain/content/messageTypes";
import { LocalizedLink } from "./LocalizedLink";

export interface BroughtToYouBySectionProps {
  readonly content: BroughtToYouByContent;
}

export const BroughtToYouBySection = ({ content }: BroughtToYouBySectionProps) => {
  return (
    <section className="usa-section">
      <div className="grid-container">
        <h2 className="font-heading-2xl dark-blue">{content.title}</h2>
        <div className="brought-to-you-by__logos">
          {content.agencies.map((agency) => (
            <LocalizedLink
              key={agency.name}
              className="brought-to-you-by__agency"
              link={agency.link}
            >
              {/* TODO: Change to <Image> */}
              {/** biome-ignore lint/performance/noImgElement: Next.js was throwing warnings regarding that were not easily resolvable */}
              <img src={agency.logo} alt={agency.logoAlt} className="brought-to-you-by__logo" />
              <span className="brought-to-you-by__name">{agency.name}</span>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </section>
  );
};
