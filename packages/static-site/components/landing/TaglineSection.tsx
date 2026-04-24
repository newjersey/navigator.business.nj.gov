/**
 * Renders the tagline section beneath the hero area.
 *
 * This module shows the section heading and a list of body paragraphs from
 * localized landing content.
 */

import type { LandingTaglineContent } from "@/domain/landing/types";

/**
 * Describes props used by the tagline section component.
 *
 * This type defines a stable shape for related data.
 */
export interface TaglineSectionProps {
  /** Localized tagline content. */
  readonly content: LandingTaglineContent;
}

/**
 * Describes input used to render one tagline paragraph.
 *
 * This type defines a stable shape for related data.
 */
interface RenderTaglineParagraphParams {
  /** Tagline paragraph text. */
  readonly paragraph: string;
  /** Positional index for React key generation fallback. */
  readonly index: number;
}

/**
 * Renders one paragraph in the tagline body column.
 *
 * @param params Render parameters.
 * @param params.paragraph Paragraph text to display.
 * @param params.index Position used for fallback key composition.
 * @returns One paragraph element.
 * @example
 * ```tsx
 * renderTaglineParagraph({ paragraph: "Start your business plan.", index: 0 });
 * ```
 */
const renderTaglineParagraph = ({ paragraph, index }: RenderTaglineParagraphParams) => {
  return <p key={`tagline-paragraph-${index}`}>{paragraph}</p>;
};

/**
 * Renders the tagline section from localized content.
 *
 * @param props Component props.
 * @param props.content Localized tagline title and paragraphs.
 * @returns The tagline section layout.
 * @example
 * ```tsx
 * <TaglineSection content={landing.tagline} />
 * ```
 */
export const TaglineSection = ({ content }: TaglineSectionProps) => {
  return (
    <section className="grid-container usa-section">
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-4">
          <h2 className="font-heading-xl margin-top-0 tablet:margin-bottom-0">{content.title}</h2>
        </div>
        <div className="tablet:grid-col-8 usa-prose">
          {content.paragraphs.map((paragraph, index) => {
            return renderTaglineParagraph({ paragraph, index });
          })}
        </div>
      </div>
    </section>
  );
};
