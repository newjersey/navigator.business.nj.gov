/**
 * Derives a page description for an update's detail page from its body.
 *
 * Updates have no dedicated description field — `RecentItem.summary` is
 * declared in the type but unused in every published item, so the first
 * paragraph of `body` is the only real description-shaped text available.
 * This strips the CMS markdown formatting the static site can't otherwise
 * render as plain text, then truncates on a word boundary for a meta
 * description-appropriate length.
 */

import { stripContentDirectives } from "@/components/learn/stripContentDirectives";

/** Target maximum length for a derived description, in characters. */
const MAX_DESCRIPTION_LENGTH = 160;

const zeroWidthJoiner = /‍/g;
const markdownLink = /\[([^\]]*)\]\([^)]*\)/g;
const markdownEmphasis = /(\*\*|__|\*|_)(.+?)\1/g;
const whitespaceRun = /\s+/g;

/**
 * Strips residual markdown emphasis and link syntax down to their plain text.
 *
 * @param text Markdown text to plain-text.
 * @returns The text with `**bold**`, `_italic_`, and `[label](href)` markup removed.
 */
const stripMarkdownFormatting = (text: string): string =>
  text.replace(markdownLink, "$1").replace(markdownEmphasis, "$2");

/**
 * Truncates text to at most `maxLength` characters, breaking on a word
 * boundary rather than mid-word, and appending an ellipsis when truncated.
 *
 * @param text Text to truncate.
 * @param maxLength Maximum length of the returned text, ellipsis included.
 * @returns The original text if already short enough, otherwise a truncated copy.
 */
const truncateOnWordBoundary = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const boundary = lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) : truncated;

  return `${boundary.trimEnd()}…`;
};

/**
 * Describes input for deriving an update's description.
 *
 * This type defines a stable shape for related data.
 */
export interface BuildUpdateDescriptionParams {
  /** Markdown body of the update, as loaded from its CMS source. */
  readonly body: string;
}

/**
 * Derives a plain-text, meta description-length summary from an update's body.
 *
 * @param params Build input.
 * @param params.body Markdown body of the update.
 * @returns A single-paragraph plain-text description, or an empty string when `body` is blank.
 * @example
 * ```ts
 * buildUpdateDescription({ body: recent.body });
 * ```
 */
export const buildUpdateDescription = ({ body }: BuildUpdateDescriptionParams): string => {
  const [firstParagraph = ""] = body.trim().split(/\n\s*\n/);

  const plainText = stripMarkdownFormatting(stripContentDirectives(firstParagraph))
    .replace(zeroWidthJoiner, "")
    .replace(whitespaceRun, " ")
    .trim();

  return truncateOnWordBoundary(plainText, MAX_DESCRIPTION_LENGTH);
};
