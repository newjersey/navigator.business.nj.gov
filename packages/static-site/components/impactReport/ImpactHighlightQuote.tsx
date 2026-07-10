import type { ImpactReportQuote } from "@/domain/content/messageTypes";

interface Props {
  readonly quote: ImpactReportQuote;
}

export const ImpactHighlightQuote = ({ quote }: Props) => {
  return (
    <blockquote className="impact-report-quote">
      <p>{quote.text}</p>
      <cite className="impact-report-quote__attribution">{quote.attribution}</cite>
    </blockquote>
  );
};
