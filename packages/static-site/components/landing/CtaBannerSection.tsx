import type { CtaBannerContent } from "@/domain/content/messageTypes";
import { LocalizedLink } from "./LocalizedLink";

export interface CtaBannerSectionProps {
  readonly content: CtaBannerContent;
}

export const CtaBannerSection = ({ content }: CtaBannerSectionProps) => {
  return (
    <section className="usa-section usa-section--dark">
      <div className="grid-container">
        <div className="grid-row grid-gap flex-align-center">
          <div className="tablet:grid-col-8">
            <h2 className="font-heading-2xl margin-top-0 margin-bottom-0">{content.title}</h2>
            <p className="margin-bottom-0">{content.subtitle}</p>
          </div>
          <div className="tablet:grid-col-4 text-right">
            <LocalizedLink
              className="usa-button usa-button--outline usa-button--inverse"
              link={content.callToActionLink}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
