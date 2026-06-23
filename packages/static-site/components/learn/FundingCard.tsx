import Markdown from "react-markdown";
import type { Funding } from "@/domain/content/types";
import { HighlightedText } from "./highlightMatches";
import { parseFundingContent } from "./parseFundingContent";

interface Props {
  readonly funding: Funding;
  readonly query?: string;
}

const FundingCard = ({ funding, query = "" }: Props) => {
  const { eligibility, benefits } = parseFundingContent(funding.contentMd ?? "");

  return (
    <div className="usa-card__container margin-bottom-3">
      <div className="usa-card__header">
        <h3 className="usa-card__heading">
          <HighlightedText text={funding.name} query={query} />
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
      <div className="usa-card__body">
        {funding.dueDate && (
          <p className="text-base margin-bottom-1">
            <strong>Due:</strong> {funding.dueDate}
          </p>
        )}
        {eligibility && (
          <div className="margin-bottom-2">
            <p className="text-bold margin-bottom-1">Eligibility</p>
            {query.trim() ? (
              <p>
                <HighlightedText text={eligibility} query={query} />
              </p>
            ) : (
              <Markdown>{eligibility}</Markdown>
            )}
          </div>
        )}
        {benefits && (
          <div className="usa-alert usa-alert--info usa-alert--no-icon" role="note">
            <div className="usa-alert__body">
              <h4 className="usa-alert__heading">Benefits</h4>
              <p className="usa-alert__text">
                <HighlightedText text={benefits} query={query} />
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundingCard;
