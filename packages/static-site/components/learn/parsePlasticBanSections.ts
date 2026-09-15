/**
 * Parses the plastic-ban-law page's indexed frontmatter fields into ordered
 * sections, mirroring the numeric-field convention `PageContent` reads
 * (`heading-N`, `main-text-N`, `link-text-N`, `link-url-N`) plus two
 * page-specific fields:
 *
 * - `collapsible-N: open | closed` marks section N as a collapsible
 *   accordion, expanded or collapsed on first render. Absent, empty, or any
 *   other value renders section N as a plain, always-visible section — CMS
 *   input is untrusted, so an unrecognized value degrades rather than throws.
 * - `contents-label-N: <text>` lists section N in the page's Contents rail
 *   under this label. The label is deliberately independent of `heading-N` so
 *   the rail can use shorter copy than the section's own heading.
 */

import type { PageItem } from "@/domain/content/types";

/** Initial open/closed state for a collapsible section. */
export type PlasticBanSectionCollapse = "open" | "closed";

/** One parsed section of the plastic-ban-law page. */
export interface PlasticBanSection {
  /** 1-based frontmatter index (`heading-N`, `main-text-N`, …). */
  readonly index: number;
  /** Anchor id for the section element; see `buildSectionId`. */
  readonly id: string;
  /** Section heading text, if authored. */
  readonly heading?: string;
  /** Section body Markdown, if authored. */
  readonly body?: string;
  /** Call-to-action label, if authored alongside `linkUrl`. */
  readonly linkText?: string;
  /** Call-to-action destination, if authored alongside `linkText`. */
  readonly linkUrl?: string;
  /** Collapsible state; absent renders the section as a plain, open section. */
  readonly collapse?: PlasticBanSectionCollapse;
  /** Label shown in the Contents rail, if this section is listed there. */
  readonly contentsLabel?: string;
}

/** One entry rendered in the page's Contents rail. */
export interface PlasticBanContentsEntry {
  /** Visible link text. */
  readonly label: string;
  /** In-page anchor destination, e.g. `#page-section-1`. */
  readonly href: string;
}

/** Highest frontmatter index scanned, matching `PageContent`. */
const MAX_SECTION_INDEX = 11;

/**
 * Builds the anchor id for section `index`. Index-based, not derived from the
 * heading text, so copy edits can never break bookmarks or inbound redirects.
 */
export const buildSectionId = (index: number): string => `page-section-${index}`;

/** Narrows a raw `collapsible-N` frontmatter value to a recognized state. */
const parseCollapse = (value: string | undefined): PlasticBanSectionCollapse | undefined => {
  if (value === "open" || value === "closed") return value;
  return undefined;
};

/** Parses one candidate section from frontmatter; `undefined` if empty. */
const parseSection = (page: PageItem, index: number): PlasticBanSection | undefined => {
  const heading = page[`heading-${index}`];
  const body = page[`main-text-${index}`];
  const linkText = page[`link-text-${index}`];
  const linkUrl = page[`link-url-${index}`];

  if (!heading && !body && !(linkText && linkUrl)) return undefined;

  return {
    index,
    id: buildSectionId(index),
    heading,
    body,
    linkText,
    linkUrl,
    collapse: parseCollapse(page[`collapsible-${index}`]),
    contentsLabel: page[`contents-label-${index}`],
  };
};

/** Parses the plastic-ban-law page's frontmatter into ordered sections. */
export const parsePlasticBanSections = (page: PageItem): PlasticBanSection[] => {
  const sections: PlasticBanSection[] = [];

  for (let index = 1; index <= MAX_SECTION_INDEX; index++) {
    const section = parseSection(page, index);
    if (section) sections.push(section);
  }

  return sections;
};

/** Narrows a section to one that carries a Contents rail label. */
const hasContentsLabel = (
  section: PlasticBanSection,
): section is PlasticBanSection & { contentsLabel: string } => Boolean(section.contentsLabel);

/** Builds the Contents rail entries for the sections that opt into one. */
export const buildContentsEntries = (
  sections: readonly PlasticBanSection[],
): PlasticBanContentsEntry[] =>
  sections.filter(hasContentsLabel).map((section) => ({
    label: section.contentsLabel,
    href: `#${section.id}`,
  }));
