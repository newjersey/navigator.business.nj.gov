import Markdown from "react-markdown";
import { ImpactHighlightQuote } from "@/components/impactReport/ImpactHighlightQuote";
import { ImpactStatGroup } from "@/components/impactReport/ImpactStatGroup";
import type { MakingItEasierContent } from "@/domain/content/messageTypes";

interface Props {
  readonly content: MakingItEasierContent;
}

export const MakingItEasierSection = ({ content }: Props) => {
  return (
    <section>
      <h2 className="text-primary-darker">{content.heading}</h2>
      <ImpactHighlightQuote quote={content.quote} />
      {content.beforeStatsParagraphs.map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static content, positional and stable per render
        <Markdown key={index}>{paragraph}</Markdown>
      ))}
      <ImpactStatGroup stats={content.stats} />
      {content.afterStatsParagraphs.map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static content, positional and stable per render
        <Markdown key={index}>{paragraph}</Markdown>
      ))}
    </section>
  );
};
