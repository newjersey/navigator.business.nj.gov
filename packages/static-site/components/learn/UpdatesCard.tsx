import Markdown from "react-markdown";
import type { UpdatesPageMessages } from "@/domain/content/messageTypes";
import type { RecentItem } from "@/domain/content/types";
import { Link } from "@/domain/i18n/navigation";
import { formatUpdateDate } from "./formatUpdateDate";
import { HighlightedText, makeHighlightPlugin } from "./highlightMatches";

interface Props {
  readonly recent: RecentItem;
  readonly messages: UpdatesPageMessages;
  readonly query?: string;
}

const UpdatesCard = ({ recent, messages, query = "" }: Props) => {
  const rehypePlugins = query.trim() ? [makeHighlightPlugin(query)] : [];
  const excerpt = recent.summary ?? recent.body;
  const detailHref = `/updates/${recent.slug}`;

  return (
    <div className="usa-card__container margin-bottom-3">
      <div className="usa-card__header">
        <h3 className="usa-card__heading">
          <Link className="text-ink" href={detailHref}>
            <HighlightedText text={recent.name} query={query} />
          </Link>
        </h3>
        {recent.date && (
          <p className="text-base margin-top-1">
            {messages.cardUpdatedLabel} {formatUpdateDate(recent.date)}
          </p>
        )}
      </div>
      <hr className="border-base-light border-top-1px margin-x-3 margin-y-1" />
      <div className="usa-card__body">
        <Markdown rehypePlugins={rehypePlugins}>{excerpt}</Markdown>
      </div>
      <div className="usa-card__footer display-flex flex-justify">
        <Link href={detailHref} className="text-primary-dark text-bold">
          {messages.cardReadMore}
        </Link>
        {recent.topics && (
          <span className="usa-tag bg-primary-lighter text-ink radius-md updates-category-tag">
            {messages.categoryLabels[recent.topics] ?? recent.topics}
          </span>
        )}
      </div>
    </div>
  );
};

export default UpdatesCard;
