import Markdown from "react-markdown";
import { Icon } from "@/components/Icon";
import type { FundingPageMessages } from "@/domain/content/messageTypes";
import type { Funding } from "@/domain/content/types";
import { HighlightedText, makeHighlightPlugin } from "./highlightMatches";
import { parseFundingContent } from "./parseFundingContent";

interface Props {
  readonly funding: Funding;
  readonly messages: FundingPageMessages;
  readonly query?: string;
}

const FundingCard = ({ funding, messages, query = "" }: Props) => {
  const { eligibility, benefits } = parseFundingContent(funding.contentMd ?? "");
  const rehypePlugins = query.trim() ? [makeHighlightPlugin(query)] : [];

  return (
    <div className="usa-card__container margin-bottom-3">
      <div className="usa-card__header">
        <h3 className="usa-card__heading">
          {funding.callToActionLink ? (
            <a
              className="funding-card__heading-link"
              href={funding.callToActionLink}
              rel="noreferrer"
              target="_blank"
            >
              <HighlightedText text={funding.name} query={query} />
            </a>
          ) : (
            <HighlightedText text={funding.name} query={query} />
          )}
        </h3>
        <div className="margin-top-1">
          {funding.status && (
            <span className="usa-tag margin-right-1">{funding.status.toUpperCase()}</span>
          )}
          {funding.fundingType && (
            <span className="usa-tag">{funding.fundingType.toUpperCase()}</span>
          )}
        </div>
      </div>
      <hr className="border-base-light border-top-1px margin-x-3 margin-y-1" />
      <div className="usa-card__body">
        {funding.dueDate && (
          <p className="text-base margin-bottom-1">
            <strong>{messages.cardDueLabel}</strong> {funding.dueDate}
          </p>
        )}
        {eligibility && (
          <div className="margin-bottom-2">
            <p className="text-bold margin-bottom-1">{messages.cardEligibilityHeading}</p>
            <Markdown rehypePlugins={rehypePlugins}>{eligibility}</Markdown>
          </div>
        )}
        {benefits && (
          <div className="usa-alert usa-alert--info usa-alert--no-icon" role="note">
            <div className="usa-alert__body">
              <h4 className="usa-alert__heading">{messages.cardBenefitsHeading}</h4>
              <div className="usa-alert__text">
                <Markdown rehypePlugins={rehypePlugins}>{benefits}</Markdown>
              </div>
            </div>
          </div>
        )}
        {funding.agencyNames && funding.agencyNames.length > 0 && (
          <p className="margin-top-2 margin-bottom-0 display-flex flex-align-start">
            <Icon
              iconName="account_balance"
              className="text-primary nj-margin-inline-end-05 nj-icon-text-top"
            />
            <span>
              <strong>{messages.cardAgencyLabel}</strong>{" "}
              <HighlightedText text={funding.agencyNames.join(", ")} query={query} />
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default FundingCard;
