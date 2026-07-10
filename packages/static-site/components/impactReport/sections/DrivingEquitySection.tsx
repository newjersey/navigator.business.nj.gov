import Markdown from "react-markdown";
import { ImpactStatGroup } from "@/components/impactReport/ImpactStatGroup";
import type { DrivingEquityContent } from "@/domain/content/messageTypes";

interface Props {
  readonly content: DrivingEquityContent;
}

export const DrivingEquitySection = ({ content }: Props) => {
  return (
    <section>
      <h2 className="text-primary-darker">{content.heading}</h2>
      {content.paragraphs.map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static content, positional and stable per render
        <Markdown key={index}>{paragraph}</Markdown>
      ))}
      <ImpactStatGroup stats={content.stats} />
    </section>
  );
};
