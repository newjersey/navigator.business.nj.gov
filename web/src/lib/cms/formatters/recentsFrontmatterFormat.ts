import matter from "gray-matter";

/**
 * Custom Decap frontmatter formatter for the Recents collection (AB#17994).
 *
 * Decap's built-in Markdown frontmatter formatter serializes with the `yaml`
 * npm package, whose default schema does not treat a bare `YYYY-MM-DD`
 * scalar as a timestamp, so it writes `date: 2025-09-03` unquoted. The
 * site's build-time content loader (`loadAllRecents`) parses that same file
 * with `gray-matter` (js-yaml), whose schema DOES resolve an unquoted
 * `YYYY-MM-DD` scalar to a native `Date`. `RecentItem.date` is typed as
 * `string`, and a `Date` there fails Next.js's `getStaticProps`
 * serialization for `/mgmt/search`, breaking the whole build.
 *
 * Using `gray-matter` here too, instead of Decap's default formatter, keeps
 * Decap's read/write behavior consistent with the loader that will parse the
 * file at build time: `gray-matter`'s own YAML engine already quotes any
 * scalar that would otherwise round-trip as a different type, including
 * date-like strings, so this collection can no longer produce the
 * unquoted shape that broke the build.
 */

interface FrontmatterEntryData {
  body?: string;
  [key: string]: unknown;
}

/**
 * gray-matter forwards options it doesn't recognize straight through to its
 * underlying js-yaml engine (see gray-matter's own `stringify`
 * implementation), but its published types constrain the options parameter
 * to gray-matter's own option names, so a real js-yaml `DumpOptions` field
 * like `lineWidth` doesn't type-check against it even though gray-matter
 * passes it through correctly at runtime. Re-typing `stringify` here (once,
 * locally) documents that intentional pass-through instead of reaching for
 * `any` at every call site.
 */
const stringifyFrontmatter = matter.stringify as (
  file: string,
  data: object,
  options?: Record<string, unknown>,
) => string;

/**
 * Orders `keys` by their position in `sortedKeys`, leaving any key not
 * present in `sortedKeys` in its original relative position. Mirrors the
 * comparator Decap's own YAML/TOML formatters use (decap-cms-core's
 * `sortKeys` helper) so switching this collection to a custom formatter
 * doesn't change the field order authors see when editing.
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
    const { data, content: body } = matter(content);
    return {
      ...data,
      ...(body.trim() && { body }),
    };
  },
  toFile(data: object, sortedKeys: string[] = []): string {
    const { body = "", ...frontmatter } = data as FrontmatterEntryData;
    const orderedFrontmatter: Record<string, unknown> = {};
    for (const key of orderKeysBySortedKeys(Object.keys(frontmatter), sortedKeys)) {
      orderedFrontmatter[key] = frontmatter[key];
    }
    // gray-matter always adds a trailing line break, which trips Decap's
    // change-detection logic, so trim it back off when the source body
    // lacked one. Mirrors decap-cms-core's own default frontmatter
    // formatter (`FrontmatterFormatter.toFile`), which this replaces for
    // this collection.
    const trimLastLineBreak = body.slice(-1) !== "\n";
    const file = stringifyFrontmatter(body, orderedFrontmatter, { lineWidth: -1 });
    return trimLastLineBreak && file.slice(-1) === "\n" ? file.slice(0, -1) : file;
  },
};
