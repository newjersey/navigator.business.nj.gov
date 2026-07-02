import { Fragment, type ReactElement } from "react";

export interface HighlightSegment {
  readonly text: string;
  readonly match: boolean;
}

export const splitHighlight = (text: string, query: string): HighlightSegment[] => {
  const needle = query.trim().toLowerCase();
  if (needle === "") {
    return [{ text, match: false }];
  }

  const segments: HighlightSegment[] = [];
  const haystack = text.toLowerCase();
  let cursor = 0;

  for (;;) {
    const index = haystack.indexOf(needle, cursor);
    if (index === -1) {
      break;
    }
    if (index > cursor) {
      segments.push({ text: text.slice(cursor, index), match: false });
    }
    segments.push({ text: text.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }

  return segments;
};

interface HighlightedTextProps {
  readonly text: string;
  readonly query: string;
}

export const HighlightedText = ({ text, query }: HighlightedTextProps): ReactElement => (
  <>
    {splitHighlight(text, query).map((segment, index) =>
      segment.match ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and stable per render
        <mark key={index} className="funding-search-highlight">
          {segment.text}
        </mark>
      ) : (
        // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and stable per render
        <Fragment key={index}>{segment.text}</Fragment>
      ),
    )}
  </>
);
