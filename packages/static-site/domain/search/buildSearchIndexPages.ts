/**
 * Builds synthetic HTML pages for the generated Pagefind index.
 *
 * The rendered Next.js app uses server output, so the search index is built
 * from the same typed content sources instead of crawling an exported folder.
 */

import {
  buildContentPageSectionHeadingId,
  buildContentPageTitleHeadingId,
} from "@/domain/content/headingIds";
import type { Funding, PageItem } from "@/domain/content/types";
import type { AppLocale } from "@/domain/i18n/locales";
import {
  buildLandingGraphicListHeadingId,
  HOME_CTA_HEADING_ID,
  HOME_FEATURED_FUNDING_HEADING_ID,
  HOME_HERO_HEADING_ID,
  HOME_TAGLINE_HEADING_ID,
} from "@/domain/landing/headingIds";
import type { LoadedLandingContent } from "@/domain/landing/loadLandingContent";
import type { LandingGraphicListItem } from "@/domain/landing/types";

/**
 * Heading text used by the homepage featured funding section.
 */
const FEATURED_FUNDING_SECTION_TITLE = "Featured Funding Opportunities";

/**
 * Matches numbered CMS heading fields such as `heading-2`.
 */
const CONTENT_PAGE_HEADING_FIELD_PATTERN = /^heading-(\d+)$/;

/**
 * Number of spaces used to indent generated HTML body elements.
 */
const HTML_INDENT = "  ";

/**
 * Describes a heading level included in generated search HTML.
 */
export type SearchIndexHeadingLevel = 1 | 2;

/**
 * One linkable section in a generated search-index page.
 */
export interface SearchIndexSection {
  /** Stable anchor ID matching an ID in the rendered page. */
  readonly id: string;
  /** Heading level used by Pagefind to build section context. */
  readonly headingLevel: SearchIndexHeadingLevel;
  /** Human-readable section heading. */
  readonly title: string;
  /** Searchable paragraph text included beneath the heading. */
  readonly paragraphs: readonly string[];
}

/**
 * One synthetic HTML page to be added to the Pagefind index.
 */
export interface SearchIndexPage {
  /** Locale-scoped public URL for the result. */
  readonly url: string;
  /** Search result title for the page. */
  readonly title: string;
  /** Optional metadata description for the generated HTML document. */
  readonly description?: string;
  /** Locale tag written to the generated HTML document. */
  readonly locale: AppLocale;
  /** Linkable sections included in the generated HTML body. */
  readonly sections: readonly SearchIndexSection[];
}

/**
 * Describes input needed to build the full search-index page list.
 */
export interface BuildSearchIndexPagesParams {
  /** Locale used to build locale-scoped result URLs. */
  readonly locale: AppLocale;
  /** Landing page content and metadata for the locale. */
  readonly loadedLandingContent: LoadedLandingContent;
  /** CMS page rendered by the current static-site package. */
  readonly businessNamesPage: PageItem;
  /** Featured funding records rendered on the homepage. */
  readonly fundings: readonly Funding[];
}

/**
 * Describes input needed to build one CMS content page search record.
 */
export interface BuildContentPageSearchIndexPageParams {
  /** Locale used to build locale-scoped result URLs. */
  readonly locale: AppLocale;
  /** CMS page rendered by the current static-site package. */
  readonly page: PageItem;
}

/**
 * Describes input needed to render one search-index page as HTML.
 */
export interface RenderSearchIndexHtmlParams {
  /** Search-index page data to render. */
  readonly page: SearchIndexPage;
}

/**
 * Describes input for normalizing text before it enters the search index.
 */
interface NormalizeSearchTextParams {
  /** Raw content text from messages or CMS fields. */
  readonly text: string;
}

/**
 * Describes one optional text value read from content sources.
 */
interface OptionalSearchTextValue {
  /** Text value that may be absent or blank. */
  readonly value: string | undefined;
}

/**
 * Describes input for building a graphic-list search section.
 */
interface BuildGraphicListSearchSectionParams {
  /** Graphic-list item content. */
  readonly item: LandingGraphicListItem;
  /** Zero-based item position in the graphic-list content array. */
  readonly index: number;
}

/**
 * Describes input for building homepage graphic-list search sections.
 */
interface BuildGraphicListSearchSectionsParams {
  /** Graphic-list items from landing page content. */
  readonly items: readonly LandingGraphicListItem[];
}

/**
 * Describes input for building a funding search paragraph.
 */
interface BuildFundingSearchParagraphParams {
  /** Featured funding record rendered on the homepage. */
  readonly funding: Funding;
}

/**
 * Describes input for collecting CMS page section numbers.
 */
interface GetContentPageSectionNumbersParams {
  /** CMS page whose numbered fields should be inspected. */
  readonly page: PageItem;
}

/**
 * Describes input for building one numbered CMS page search section.
 */
interface BuildContentPageSearchSectionParams {
  /** CMS page containing the numbered section fields. */
  readonly page: PageItem;
  /** Numeric section suffix from CMS fields such as `heading-2`. */
  readonly sectionNumber: number;
}

/**
 * Describes input for rendering one search-index section.
 */
interface RenderSearchIndexSectionParams {
  /** Section content to render as HTML. */
  readonly section: SearchIndexSection;
}

/**
 * Describes input for rendering one HTML paragraph.
 */
interface RenderHtmlParagraphParams {
  /** Plain paragraph text to render. */
  readonly paragraph: string;
}

/**
 * Describes input for escaping text in generated HTML.
 */
interface EscapeHtmlParams {
  /** Text that may contain characters with special HTML meaning. */
  readonly text: string;
}

/**
 * Checks whether a normalized text value contains searchable content.
 */
const hasSearchText = (text: string): boolean => {
  return text.trim().length > 0;
};

/**
 * Sorts section numbers in ascending numeric order.
 */
const compareNumbersAscending = (left: number, right: number): number => {
  return left - right;
};

/**
 * Converts markdown-like CMS text into plain searchable text.
 *
 * @param params Normalization input.
 * @param params.text Raw content text from messages or CMS fields.
 * @returns Plain text with markdown link URLs and formatting markers removed.
 * @example
 * ```ts
 * const text = normalizeSearchText({ text: "**Register** [online](https://example.com)" });
 * ```
 */
export const normalizeSearchText = ({ text }: NormalizeSearchTextParams): string => {
  return text
    .replaceAll(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replaceAll(/[`*_>#]+/g, " ")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/\\_/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
};

/**
 * Normalizes one optional content value.
 */
const normalizeOptionalSearchText = ({ value }: OptionalSearchTextValue): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalizedValue = normalizeSearchText({ text: value });

  if (!hasSearchText(normalizedValue)) {
    return undefined;
  }

  return normalizedValue;
};

/**
 * Removes absent values from a text collection.
 */
const isDefinedSearchText = (value: string | undefined): value is string => {
  return value !== undefined;
};

/**
 * Normalizes a list of optional text values.
 */
const normalizeSearchParagraphs = (values: readonly (string | undefined)[]): readonly string[] => {
  return values.map((value) => normalizeOptionalSearchText({ value })).filter(isDefinedSearchText);
};

/**
 * Builds one homepage graphic-list search section.
 */
const buildGraphicListSearchSection = ({
  item,
  index,
}: BuildGraphicListSearchSectionParams): SearchIndexSection => {
  return {
    id: buildLandingGraphicListHeadingId({ index }),
    headingLevel: 2,
    title: item.title,
    paragraphs: normalizeSearchParagraphs([item.paragraph]),
  };
};

/**
 * Builds homepage graphic-list search sections.
 */
const buildGraphicListSearchSections = ({
  items,
}: BuildGraphicListSearchSectionsParams): readonly SearchIndexSection[] => {
  const sections: SearchIndexSection[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];

    if (item) {
      sections.push(buildGraphicListSearchSection({ item, index }));
    }
  }

  return sections;
};

/**
 * Builds one searchable paragraph for a funding card.
 */
const buildFundingSearchParagraph = ({ funding }: BuildFundingSearchParagraphParams): string => {
  return normalizeSearchText({
    text: `${funding.name}. ${funding.summaryDescriptionMd} ${funding.callToActionText}`,
  });
};

/**
 * Builds the homepage search-index page for one locale.
 */
const buildLandingSearchIndexPage = ({
  locale,
  loadedLandingContent,
  fundings,
}: Omit<BuildSearchIndexPagesParams, "businessNamesPage">): SearchIndexPage => {
  const landing = loadedLandingContent.landing;
  const graphicListSections = buildGraphicListSearchSections({
    items: landing.graphicList.items,
  });
  const fundingParagraphs = fundings.map((funding) => {
    return buildFundingSearchParagraph({ funding });
  });

  return {
    url: `/${locale}`,
    title: loadedLandingContent.metadata.title,
    description: loadedLandingContent.metadata.description,
    locale,
    sections: [
      {
        id: HOME_HERO_HEADING_ID,
        headingLevel: 1,
        title: `${landing.hero.callout} ${landing.hero.title}`,
        paragraphs: normalizeSearchParagraphs([
          landing.hero.paragraph,
          landing.hero.callToActionLink.label,
        ]),
      },
      {
        id: HOME_TAGLINE_HEADING_ID,
        headingLevel: 2,
        title: landing.tagline.title,
        paragraphs: normalizeSearchParagraphs(landing.tagline.paragraphs),
      },
      ...graphicListSections,
      {
        id: HOME_FEATURED_FUNDING_HEADING_ID,
        headingLevel: 2,
        title: FEATURED_FUNDING_SECTION_TITLE,
        paragraphs: fundingParagraphs.filter(hasSearchText),
      },
      {
        id: HOME_CTA_HEADING_ID,
        headingLevel: 2,
        title: landing.callToAction.title,
        paragraphs: normalizeSearchParagraphs([
          landing.callToAction.intro,
          landing.callToAction.callToActionLink.label,
        ]),
      },
    ],
  };
};

/**
 * Collects numbered CMS page section suffixes.
 */
const getContentPageSectionNumbers = ({
  page,
}: GetContentPageSectionNumbersParams): readonly number[] => {
  const sectionNumbers = new Set<number>();

  for (const key of Object.keys(page)) {
    const match = CONTENT_PAGE_HEADING_FIELD_PATTERN.exec(key);

    if (match?.[1]) {
      sectionNumbers.add(Number(match[1]));
    }
  }

  sectionNumbers.delete(1);

  return Array.from(sectionNumbers).sort(compareNumbersAscending);
};

/**
 * Builds one numbered CMS page search section.
 */
const buildContentPageSearchSection = ({
  page,
  sectionNumber,
}: BuildContentPageSearchSectionParams): SearchIndexSection | undefined => {
  const heading = normalizeOptionalSearchText({ value: page[`heading-${sectionNumber}`] });
  const mainText = page[`main-text-${sectionNumber}`];

  if (!heading && !mainText) {
    return undefined;
  }

  return {
    id: buildContentPageSectionHeadingId({ pageSlug: page.slug, sectionNumber }),
    headingLevel: 2,
    title: heading ?? page.name,
    paragraphs: normalizeSearchParagraphs([mainText]),
  };
};

/**
 * Builds all numbered CMS page search sections.
 */
const buildContentPageSearchSections = (page: PageItem): readonly SearchIndexSection[] => {
  const sections: SearchIndexSection[] = [];
  const sectionNumbers = getContentPageSectionNumbers({ page });

  for (const sectionNumber of sectionNumbers) {
    const section = buildContentPageSearchSection({ page, sectionNumber });

    if (section) {
      sections.push(section);
    }
  }

  return sections;
};

/**
 * Builds one CMS content page search-index page.
 *
 * @param params Page input.
 * @param params.locale Locale used to build the public URL.
 * @param params.page CMS page rendered by the static-site package.
 * @returns Search-index page data for the CMS page.
 * @example
 * ```ts
 * const page = buildContentPageSearchIndexPage({ locale: "en-US", page: businessNamesPage });
 * ```
 */
export const buildContentPageSearchIndexPage = ({
  locale,
  page,
}: BuildContentPageSearchIndexPageParams): SearchIndexPage => {
  const titleSection: SearchIndexSection = {
    id: buildContentPageTitleHeadingId({ pageSlug: page.slug }),
    headingLevel: 1,
    title: page.name,
    paragraphs: normalizeSearchParagraphs([
      page["sub-heading-text"],
      page["main-text-1"],
      page["meta-data"],
      page["main-link-text"],
    ]),
  };

  return {
    url: `/${locale}/${page.slug}`,
    title: page.name,
    description: normalizeOptionalSearchText({ value: page["sub-heading-text"] }),
    locale,
    sections: [titleSection, ...buildContentPageSearchSections(page)],
  };
};

/**
 * Builds every search-index page currently backed by rendered routes.
 *
 * @param params Search-index content input.
 * @param params.locale Locale used to build locale-scoped result URLs.
 * @param params.loadedLandingContent Landing page content and metadata.
 * @param params.businessNamesPage CMS page rendered at `/business-names`.
 * @param params.fundings Featured funding records rendered on the homepage.
 * @returns Search-index pages for the current static-site routes.
 * @example
 * ```ts
 * const pages = buildSearchIndexPages({ locale, loadedLandingContent, businessNamesPage, fundings });
 * ```
 */
export const buildSearchIndexPages = ({
  locale,
  loadedLandingContent,
  businessNamesPage,
  fundings,
}: BuildSearchIndexPagesParams): readonly SearchIndexPage[] => {
  return [
    buildLandingSearchIndexPage({ locale, loadedLandingContent, fundings }),
    buildContentPageSearchIndexPage({ locale, page: businessNamesPage }),
  ];
};

/**
 * Escapes text for generated HTML text nodes and attributes.
 */
const escapeHtml = ({ text }: EscapeHtmlParams): string => {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
};

/**
 * Renders one paragraph for generated search HTML.
 */
const renderHtmlParagraph = ({ paragraph }: RenderHtmlParagraphParams): string => {
  return `${HTML_INDENT}${HTML_INDENT}${HTML_INDENT}<p>${escapeHtml({ text: paragraph })}</p>`;
};

/**
 * Renders one section for generated search HTML.
 */
const renderSearchIndexSection = ({ section }: RenderSearchIndexSectionParams): string => {
  const headingTag = `h${section.headingLevel}`;
  const heading = `${HTML_INDENT}${HTML_INDENT}<${headingTag} id="${escapeHtml({
    text: section.id,
  })}">${escapeHtml({ text: section.title })}</${headingTag}>`;
  const paragraphs = section.paragraphs.map((paragraph) => {
    return renderHtmlParagraph({ paragraph });
  });

  return [heading, ...paragraphs].join("\n");
};

/**
 * Renders one search-index page as synthetic HTML for Pagefind.
 *
 * @param params Render input.
 * @param params.page Search-index page data to render.
 * @returns HTML string ready for Pagefind indexing.
 * @example
 * ```ts
 * const html = renderSearchIndexHtml({ page });
 * ```
 */
export const renderSearchIndexHtml = ({ page }: RenderSearchIndexHtmlParams): string => {
  const descriptionMeta = page.description
    ? `${HTML_INDENT}<meta name="description" content="${escapeHtml({ text: page.description })}">\n`
    : "";
  const sections = page.sections.map((section) => {
    return renderSearchIndexSection({ section });
  });

  return [
    "<!doctype html>",
    `<html lang="${page.locale}">`,
    "<head>",
    `${HTML_INDENT}<meta charset="utf-8">`,
    `${HTML_INDENT}<title>${escapeHtml({ text: page.title })}</title>`,
    `${descriptionMeta}</head>`,
    "<body>",
    `${HTML_INDENT}<main data-pagefind-body>`,
    sections.join("\n"),
    `${HTML_INDENT}</main>`,
    "</body>",
    "</html>",
  ].join("\n");
};
