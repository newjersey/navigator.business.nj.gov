import Markdown from "react-markdown";
import type { ImpactReportFootnote } from "@/domain/content/messageTypes";

interface Props {
  readonly footnotes: readonly ImpactReportFootnote[];
}

export const ImpactFootnotes = ({ footnotes }: Props) => {
  return (
    <div className="impact-report-footnotes bg-info-lighter radius-lg text-small">
      <hr className="border-base-light border-top-1px" />
      <ol>
        {footnotes.map((footnote) => (
          <li key={footnote.id} id={`impact-report-footnote-${footnote.id}`}>
            <Markdown>{footnote.text}</Markdown>
            <a
              href={`#impact-report-citation-${footnote.id}`}
              aria-label={`Back to content for footnote ${footnote.id}`}
              className="usa-sr-only"
            >
              Back to content
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
};
