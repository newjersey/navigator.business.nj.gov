/**
 * Resolves the correct locale-aware title for a content page.
 *
 * Some pages render a message-driven `<h1>` instead of the page's own `name`
 * frontmatter (which is English-only): `funding` and
 * `licensing-and-certification-guide` via `PageSwitchComponent`, and
 * `housing-developer-resources` via its own route. This resolver mirrors those
 * same slugs so a page's metadata title always matches what actually renders as
 * its `<h1>`, in every locale.
 */

import type { ApplicationMessages } from "@/domain/content/messageTypes";
import type { PageItem } from "@/domain/content/types";

/**
 * Describes input for resolving a content page's title.
 *
 * This type defines a stable shape for related data.
 */
export interface ResolvePageTitleParams {
  /** The content page to resolve a title for. */
  readonly page: PageItem;
  /** Localized messages for the page's locale. */
  readonly messages: ApplicationMessages;
}

/**
 * Resolves the title that matches the page's rendered `<h1>`.
 *
 * @param params Resolve input.
 * @param params.page The content page to resolve a title for.
 * @param params.messages Localized messages for the page's locale.
 * @returns The locale-correct page title.
 * @example
 * ```ts
 * resolvePageTitle({ page: fundingPage, messages: esMessages });
 * // the es-US funding title, not the page's English-only frontmatter name
 * ```
 */
export const resolvePageTitle = ({ page, messages }: ResolvePageTitleParams): string => {
  switch (page.slug) {
    case "funding":
      return messages.funding.title;
    case "housing-developer-resources":
      return messages.housingDeveloperResources.title;
    case "licensing-and-certification-guide":
      return messages.licensingGuide.title;
    default:
      return page.name;
  }
};
