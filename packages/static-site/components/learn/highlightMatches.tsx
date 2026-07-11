import type { Element, ElementContent, Parents, Root, Text } from "hast";
import { Fragment, type ReactElement } from "react";
import type { Node } from "unist";
import { SKIP, visitParents } from "unist-util-visit-parents";

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

/**
 * `react-markdown` rehype plugin that wraps query matches inside rendered
 * markdown text nodes in `<mark>` elements, so search highlighting reaches card
 * body content (not just the plain-text heading handled by `HighlightedText`).
 */
export const makeHighlightPlugin = (query: string) => () => (tree: Root) => {
  visitParents(tree as Node, "text", (node: Text, ancestors) => {
    const parent = ancestors.at(-1) as Parents | undefined;
    if (parent === undefined) return;
    const index = parent.children.indexOf(node);
    const segments = splitHighlight(node.value, query);
    if (segments.length === 1 && !segments[0].match) return;

    const replacement: ElementContent[] = segments.map((seg) =>
      seg.match
        ? {
            type: "element",
            tagName: "mark",
            properties: { className: ["funding-search-highlight"] },
            children: [{ type: "text", value: seg.text }],
          }
        : { type: "text", value: seg.text },
    );

    (parent as Element).children.splice(index, 1, ...replacement);
    // The replacement nodes (including their <mark> text children) are newly
    // inserted, not part of the original tree. Without skipping past them,
    // the visitor would re-visit and re-wrap the same matched text again.
    return [SKIP, index + replacement.length];
  });
};
