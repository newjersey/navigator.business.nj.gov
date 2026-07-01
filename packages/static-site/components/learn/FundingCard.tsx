import type { Element, ElementContent, Parents, Root, Text } from "hast";
import Markdown from "react-markdown";
import type { Node } from "unist";
import { visitParents } from "unist-util-visit-parents";
import type { FundingPageMessages } from "@/domain/content/messageTypes";
import type { Funding } from "@/domain/content/types";
import { HighlightedText, splitHighlight } from "./highlightMatches";
import { parseFundingContent } from "./parseFundingContent";

interface Props {
  readonly funding: Funding;
  readonly messages: FundingPageMessages;
  readonly query?: string;
}

const makeHighlightPlugin = (query: string) => () => (tree: Root) => {
  visitParents(tree as Node, "text", (node: Text, ancestors) => {
    const parent = ancestors.at(-1) as Parents | undefined;
    if (parent === undefined) return;
    const index = parent.children.indexOf(node);
    const segments = splitHighlight(node.value, query);
    if (segments.length === 1 && !segments[0].match) return;

    const replacement: ElementContent[] = segments.map((seg) =>
      seg.match
        ? {
            type: "element",
            tagName: "mark",
            properties: { className: ["funding-search-highlight"] },
            children: [{ type: "text", value: seg.text }],
          }
        : { type: "text", value: seg.text },
    );

    (parent as Element).children.splice(index, 1, ...replacement);
  });
};

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
      </div>
    </div>
  );
};

export default FundingCard;
