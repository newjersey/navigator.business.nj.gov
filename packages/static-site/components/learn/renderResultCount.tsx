import { Fragment, type ReactNode } from "react";

export interface ResultCountMessages {
  /** Unfiltered window; {start}, {end}, {total}; range wrapped in <bold>. */
  readonly resultCountShowing: string;
  /** Filtered window; {start}, {end}, {filtered}, {total}; range wrapped in <bold>. */
  readonly resultCountFiltered: string;
  /** Filtered set is empty; {total}. */
  readonly resultCountFilteredEmpty: string;
}

interface RenderResultCountParams {
  /** 1-based index of the first item shown on the current page. */
  readonly start: number;
  /** 1-based index of the last item shown on the current page. */
  readonly end: number;
  /** Number of items on the current page. */
  readonly shownCount: number;
  /** Total items after filtering. */
  readonly filteredCount: number;
  /** Total items before filtering. */
  readonly totalCount: number;
  readonly messages: ResultCountMessages;
}

const substitute = (template: string, values: Record<string, number>): string =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );

/**
 * Renders the paginated result-count line. Surfaces the current page window
 * (bolded) against the active result set, adding a grand-total parenthetical
 * only when a filter is narrowing the list, and collapsing to a no-range empty
 * message when nothing matches. The whole sentence stays in one localized
 * template per state so translators control word order around the bolded range.
 */
export const renderResultCount = ({
  start,
  end,
  shownCount,
  filteredCount,
  totalCount,
  messages,
}: RenderResultCountParams): ReactNode => {
  const isFiltered = filteredCount !== totalCount;

  if (isFiltered && shownCount === 0) {
    return substitute(messages.resultCountFilteredEmpty, { total: totalCount });
  }

  const template = isFiltered ? messages.resultCountFiltered : messages.resultCountShowing;
  const filled = substitute(template, {
    start,
    end,
    filtered: filteredCount,
    total: totalCount,
  });

  return filled.split(/(<bold>.*?<\/bold>)/).map((part, index) => {
    const boldMatch = part.match(/^<bold>(.*?)<\/bold>$/);
    if (boldMatch === null) {
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and stable per render
      return <Fragment key={index}>{part}</Fragment>;
    }
    // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and stable per render
    return <strong key={index}>{boldMatch[1]}</strong>;
  });
};
