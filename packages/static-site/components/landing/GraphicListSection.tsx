/**
 * Renders the dark graphic-list section on the landing page.
 *
 * This module groups item cards into display rows and maps each item into
 * NJWDS-compatible markup.
 */

import Image from "next/image";

import type { LandingGraphicListContent, LandingGraphicListItem } from "@/domain/landing/types";

/**
 * Sets how many graphic-list cards are shown per row.
 *
 * This matches the intended NJWDS landing page layout in this adapter.
 */
const GRAPHIC_LIST_ROW_SIZE = 2;

/**
 * Describes props used by the graphic-list section component.
 *
 * This type defines a stable shape for related data.
 */
export interface GraphicListSectionProps {
  /** Localized graphic-list content. */
  readonly content: LandingGraphicListContent;
}

/**
 * Describes input used to split graphic-list items into row groups.
 *
 * This type defines a stable shape for related data.
 */
interface BuildGraphicListRowsParams {
  /** Flat collection of graphic-list items. */
  readonly items: readonly LandingGraphicListItem[];
}

/**
 * Describes input used to render one graphic-list row.
 *
 * This type defines a stable shape for related data.
 */
interface RenderGraphicListRowParams {
  /** Row items and row index metadata. */
  readonly row: readonly LandingGraphicListItem[];
  /** Positional row index. */
  readonly rowIndex: number;
}

/**
 * Describes input used to render one graphic-list card.
 *
 * This type defines a stable shape for related data.
 */
interface RenderGraphicListItemParams {
  /** Item content and positional metadata. */
  readonly item: LandingGraphicListItem;
  /** Positional item index for React keys. */
  readonly itemIndex: number;
}

/**
 * Splits a flat item list into row-sized groups.
 *
 * @param params Row-building input.
 * @param params.items Flat list of graphic-list items.
 * @returns Item rows that each contain up to `GRAPHIC_LIST_ROW_SIZE` entries.
 * @example
 * ```ts
 * const rows = buildGraphicListRows({ items: content.items });
 * ```
 */
const buildGraphicListRows = ({
  items,
}: BuildGraphicListRowsParams): readonly (readonly LandingGraphicListItem[])[] => {
  const rows: LandingGraphicListItem[][] = [];

  for (let startIndex = 0; startIndex < items.length; startIndex += GRAPHIC_LIST_ROW_SIZE) {
    rows.push(items.slice(startIndex, startIndex + GRAPHIC_LIST_ROW_SIZE));
  }

  return rows;
};

/**
 * Renders one graphic-list card.
 *
 * @param params Render parameters.
 * @param params.item Card content.
 * @param params.itemIndex Position used for fallback key composition.
 * @returns One card element.
 * @example
 * ```tsx
 * renderGraphicListItem({ item: content.items[0], itemIndex: 0 });
 * ```
 */
const renderGraphicListItem = ({ item, itemIndex }: RenderGraphicListItemParams) => {
  return (
    <div className="usa-media-block tablet:grid-col" key={`${item.title}-${itemIndex}`}>
      <Image
        alt={item.imageAlt}
        className="usa-media-block__img"
        height={124}
        src="/vendor/img/circle-124.png"
        width={124}
      />
      <div className="usa-media-block__body">
        <h2 className="usa-graphic-list__heading">{item.title}</h2>
        <p>{item.paragraph}</p>
      </div>
    </div>
  );
};

/**
 * Renders one row of graphic-list cards.
 *
 * @param params Render parameters.
 * @param params.row Row items.
 * @param params.rowIndex Position used for fallback key composition.
 * @returns One row wrapper that contains card elements.
 * @example
 * ```tsx
 * renderGraphicListRow({ row: content.items.slice(0, 2), rowIndex: 0 });
 * ```
 */
const renderGraphicListRow = ({ row, rowIndex }: RenderGraphicListRowParams) => {
  return (
    <div className="usa-graphic-list__row grid-row grid-gap" key={`graphic-list-row-${rowIndex}`}>
      {row.map((item, itemIndex) => {
        return renderGraphicListItem({ item, itemIndex });
      })}
    </div>
  );
};

/**
 * Renders the full graphic-list section.
 *
 * @param props Component props.
 * @param props.content Localized graphic-list content.
 * @returns The full graphic-list section.
 * @example
 * ```tsx
 * <GraphicListSection content={landing.graphicList} />
 * ```
 */
export const GraphicListSection = ({ content }: GraphicListSectionProps) => {
  const rows = buildGraphicListRows({ items: content.items });

  return (
    <section className="usa-graphic-list usa-section usa-section--dark">
      <div className="grid-container">
        {rows.map((row, rowIndex) => {
          return renderGraphicListRow({ row, rowIndex });
        })}
      </div>
    </section>
  );
};
