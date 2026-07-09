import Image from "next/image";
import Markdown from "react-markdown";
import { ImpactHighlightQuote } from "@/components/impactReport/ImpactHighlightQuote";
import { ImpactStatGroup } from "@/components/impactReport/ImpactStatGroup";
import type { CustomerServiceExperienceContent } from "@/domain/content/messageTypes";

interface Props {
  readonly content: CustomerServiceExperienceContent;
}

export const CustomerServiceExperienceSection = ({ content }: Props) => {
  return (
    <section>
      <h2 className="text-primary-darker">{content.heading}</h2>
      {content.beforeQuoteParagraphs.map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static content, positional and stable per render
        <Markdown key={index}>{paragraph}</Markdown>
      ))}
      <ImpactHighlightQuote quote={content.quote} />
      {content.afterQuoteParagraphs.map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static content, positional and stable per render
        <Markdown key={index}>{paragraph}</Markdown>
      ))}
      <div className="grid-row grid-gap flex-align-center margin-y-3">
        <div className="tablet:grid-col-7">
          {content.imageRowParagraphs.map((paragraph, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs are static content, positional and stable per render
            <Markdown key={index}>{paragraph}</Markdown>
          ))}
        </div>
        <div className="tablet:grid-col-5">
          <Image
            src={content.image.src}
            alt={content.image.alt}
            width={800}
            height={533}
            sizes="(min-width: 64em) 480px, 100vw"
            className="width-full height-auto radius-md"
          />
        </div>
      </div>
      <ImpactStatGroup stats={content.stats} />
    </section>
  );
};
