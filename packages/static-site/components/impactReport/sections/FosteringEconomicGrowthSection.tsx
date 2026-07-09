import Markdown from "react-markdown";
import { ImpactFootnotes } from "@/components/impactReport/ImpactFootnotes";
import { ImpactStatGroup } from "@/components/impactReport/ImpactStatGroup";
import type { FosteringEconomicGrowthContent } from "@/domain/content/messageTypes";

interface Props {
  readonly content: FosteringEconomicGrowthContent;
}

export const FosteringEconomicGrowthSection = ({ content }: Props) => {
  return (
    <section>
      <h2 className="text-primary-darker">{content.heading}</h2>
      <div className="grid-row grid-gap flex-align-start margin-y-3">
        <div className="tablet:grid-col-6">
          {content.paragraphs.map((paragraph, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static content, positional and stable per render
            <Markdown key={index}>{paragraph}</Markdown>
          ))}
        </div>
        <div className="tablet:grid-col-6">
          <ImpactStatGroup stats={content.stats} />
        </div>
      </div>
      <ImpactFootnotes footnotes={content.footnotes} />
    </section>
  );
};
