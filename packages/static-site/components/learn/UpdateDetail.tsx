import Markdown from "react-markdown";
import type { UpdatesPageMessages } from "@/domain/content/messageTypes";
import type { RecentItem } from "@/domain/content/types";
import { formatUpdateDate } from "./formatUpdateDate";

interface Props {
  readonly recent: RecentItem;
  readonly messages: UpdatesPageMessages;
}

const UpdateDetail = ({ recent, messages }: Props) => {
  const ctaLabel = recent["cta-text"] ?? messages.detailCtaFallback;

  return (
    <article className="grid-container usa-section">
      <h1>{recent.name}</h1>
      <div className="margin-bottom-3">
        {recent.date && (
          <p className="text-base margin-bottom-1">
            <strong>{messages.cardUpdatedLabel}</strong> {formatUpdateDate(recent.date)}
          </p>
        )}
        {recent.topics && (
          <span className="usa-tag bg-primary-lighter text-ink radius-md updates-category-tag">
            {messages.categoryLabels[recent.topics] ?? recent.topics}
          </span>
        )}
      </div>
      <Markdown>{recent.body}</Markdown>
      {recent["cta-link"] && (
        <a
          href={recent["cta-link"]}
          className="usa-button margin-top-3"
          rel="noreferrer"
          target="_blank"
        >
          {ctaLabel}
        </a>
      )}
    </article>
  );
};

export default UpdateDetail;
