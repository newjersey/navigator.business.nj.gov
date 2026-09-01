import { getMarkdown } from "@businessnjgovnavigator/shared/markdownReader";
import matter from "gray-matter";

/**
 * Decap's default frontmatter formatter and the site's build-time content
 * loader disagree on whether a bare `YYYY-MM-DD` scalar is a timestamp, so
 * Decap can write an unquoted date that the loader then reads back as a
 * `Date` instead of a `string`. Using `gray-matter` (the loader's own
 * engine) here instead keeps the two in sync, so this collection can't
 * produce that shape.
 */

interface FrontmatterEntryData {
  body?: string;
  [key: string]: unknown;
}

// gray-matter passes unrecognized options straight through to js-yaml at
// runtime, but its types don't include js-yaml's own option names (e.g.
// `lineWidth`), so this re-types `stringify` once instead of casting at
// every call site.
const stringifyFrontmatter = matter.stringify as (
  file: string,
  data: object,
  options?: Record<string, unknown>,
) => string;

/**
 * Orders `keys` by their position in `sortedKeys`, leaving any key not
 * present in `sortedKeys` in its original relative position. Mirrors
 * decap-cms-core's own `sortKeys` helper so this formatter doesn't change
 * field order relative to Decap's built-in ones.
 */
export const orderKeysBySortedKeys = (keys: string[], sortedKeys: string[]): string[] => {
  return [...keys].sort((a, b) => {
    const indexOfA = sortedKeys.indexOf(a);
    const indexOfB = sortedKeys.indexOf(b);
    if (indexOfA === -1 || indexOfB === -1) return 0;
    return indexOfA - indexOfB;
  });
};

export const recentsFrontmatterFormat = {
  fromFile(content: string): unknown {
    const { content: body, grayMatter } = getMarkdown(content);
    return {
      ...(grayMatter as object),
      ...(body.trim() && { body }),
    };
  },
  toFile(data: object, sortedKeys: string[] = []): string {
    const { body = "", ...frontmatter } = data as FrontmatterEntryData;
    const orderedFrontmatter: Record<string, unknown> = {};
    for (const key of orderKeysBySortedKeys(Object.keys(frontmatter), sortedKeys)) {
      orderedFrontmatter[key] = frontmatter[key];
    }
    // Mirrors decap-cms-core's own default formatter: gray-matter always
    // appends a trailing newline, which would otherwise trip Decap's
    // change-detection when the source body didn't have one.
    const trimLastLineBreak = body.slice(-1) !== "\n";
    const file = stringifyFrontmatter(body, orderedFrontmatter, { lineWidth: -1 });
    return trimLastLineBreak && file.slice(-1) === "\n" ? file.slice(0, -1) : file;
  },
};
