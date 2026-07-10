import Image from "next/image";
import Markdown from "react-markdown";
import { ImpactHighlightQuote } from "@/components/impactReport/ImpactHighlightQuote";
import { ImpactStatGroup } from "@/components/impactReport/ImpactStatGroup";
import type { AboutUsContent } from "@/domain/content/messageTypes";

interface Props {
  readonly content: AboutUsContent;
}

export const AboutUsSection = ({ content }: Props) => {
  return (
    <section>
      <h2 className="text-primary-darker">{content.heading}</h2>
      <ImpactHighlightQuote quote={content.quote} />
      <Markdown>{content.introParagraph}</Markdown>
      <div className="grid-row grid-gap flex-align-center margin-y-3">
        <div className="tablet:grid-col-7">
          <Markdown>{content.resourcesParagraph}</Markdown>
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
      <Markdown>{content.closingParagraph}</Markdown>
      <ImpactStatGroup stats={content.stats} />
    </section>
  );
};
