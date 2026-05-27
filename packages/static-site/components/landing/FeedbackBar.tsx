import type { FeedbackBarContent } from "@/domain/content/messageTypes";

export interface FeedbackBarProps {
  readonly content: FeedbackBarContent;
}

export const FeedbackBar = ({ content }: FeedbackBarProps) => {
  return (
    <section className="usa-section usa-section--dark padding-y-3">
      <div className="grid-container">
        <div className="grid-row grid-gap flex-align-center">
          <div className="tablet:grid-col-8">
            <p className="margin-y-0 font-body-md">{content.question}</p>
          </div>
          <div className="tablet:grid-col-4 text-right">
            <button
              className="usa-button usa-button--outline usa-button--inverse margin-right-1"
              type="button"
            >
              {content.yesLabel}
            </button>
            <button className="usa-button usa-button--outline usa-button--inverse" type="button">
              {content.noLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
