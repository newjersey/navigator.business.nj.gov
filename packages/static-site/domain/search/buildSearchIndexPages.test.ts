import { describe, expect, it } from "vitest";

import type { Funding, PageItem } from "@/domain/content/types";
import type { LoadedLandingContent } from "@/domain/landing/loadLandingContent";
import {
  buildContentPageSearchIndexPage,
  buildSearchIndexPages,
  normalizeSearchText,
  renderSearchIndexHtml,
} from "./buildSearchIndexPages";

/**
 * Landing content used by search-index builder tests.
 */
const LOADED_LANDING_CONTENT: LoadedLandingContent = {
  metadata: {
    title: "Business.NJ.gov | Plan, Start, and Grow",
    description: "Find business guidance.",
  },
  landing: {
    skipNavigationLabel: "Skip",
    mainContentId: "main-content",
    banner: {
      sectionAriaLabel: "Official",
      stateSealAlt: "Seal",
      stateSiteLink: {
        label: "State",
        href: "https://nj.gov",
        isInternal: false,
        opensInNewTab: true,
      },
      governorIdentityLink: {
        label: "Governor",
        href: "https://nj.gov/governor",
        isInternal: false,
        opensInNewTab: true,
      },
      updatesLink: {
        label: "Updates",
        href: "https://nj.gov/subscribe",
        isInternal: false,
        opensInNewTab: true,
      },
    },
    header: {
      primaryNavigationAriaLabel: "Primary",
      homeLink: {
        label: "Home",
        href: "/",
        isInternal: true,
        opensInNewTab: false,
      },
      homeLinkTitle: "Home",
      homeLinkAriaLabel: "Home",
      siteTitle: "Business.NJ.gov",
      menuButtonLabel: "Menu",
      closeButtonAlt: "Close",
      primaryItems: [],
      secondaryLinks: [],
      searchAction: "/search",
      searchInputLabel: "Search site",
      searchSubmitIconAlt: "Search",
    },
    hero: {
      sectionAriaLabel: "Intro",
      callout: "Your New Jersey business needs.",
      title: "All in one place.",
      paragraph: "Get guidance for planning a business.",
      callToActionLink: {
        label: "Get a guide",
        href: "https://business.nj.gov",
        isInternal: false,
        opensInNewTab: true,
      },
    },
    tagline: {
      title: "Start, operate, and grow",
      paragraphs: ["Use resources for business registration."],
    },
    graphicList: {
      items: [
        {
          title: "Business Registration",
          paragraph: "Register your business with clear steps.",
          imageAlt: "Registration",
        },
      ],
    },
    callToAction: {
      sectionId: "support",
      title: "For More Support",
      intro: "Connect with support programs.",
      callToActionLink: {
        label: "Explore support",
        href: "https://business.nj.gov",
        isInternal: false,
        opensInNewTab: true,
      },
    },
    footer: {
      returnToTopLabel: "Top",
      navigationAriaLabel: "Footer",
      primaryLinks: [],
      agencyLogoAlt: "Logo",
      agencyName: "Agency",
      socialLinks: [],
      contactHeading: "Contact",
      phoneLink: {
        label: "Phone",
        href: "tel:1",
        isInternal: false,
        opensInNewTab: false,
      },
      emailLink: {
        label: "Email",
        href: "mailto:test@example.com",
        isInternal: false,
        opensInNewTab: false,
      },
    },
    identifier: {
      agencySectionAriaLabel: "Agency",
      stateLogoAlt: "State logo",
      agencyLogoAlt: "Agency logo",
      domain: "business.nj.gov",
      disclaimerPrefix: "Official",
      disclaimerLink: {
        label: "State",
        href: "https://nj.gov",
        isInternal: false,
        opensInNewTab: true,
      },
      importantLinksAriaLabel: "Important",
      requiredLinks: [],
      usGovernmentSectionAriaLabel: "US",
      usGovernmentDescription: "US site",
    },
  },
};

/**
 * Creates a CMS page for search-index builder tests.
 */
const createBusinessNamesPage = (): PageItem => {
  return {
    name: "Business Names",
    slug: "business-names",
    "sub-heading-text": "Learn how to name your business.",
    "main-text-1": "Your business name represents your company.",
    "meta-data": "alternate names DBA",
    "main-link-text": "Name Your Business",
    "heading-2": "Search Available Business Names",
    "main-text-2": "**Search** for an available [business name](https://example.com).",
  };
};

/**
 * Creates a funding record for search-index builder tests.
 */
const createFunding = (): Funding => {
  return {
    name: "Small Business Grant",
    summaryDescriptionMd: "Funding for eligible small businesses.",
    callToActionText: "Apply",
  } as Funding;
};

/**
 * Verifies markdown-like source text is normalized for search excerpts.
 */
const shouldNormalizeMarkdownText = () => {
  const normalized = normalizeSearchText({
    text: "**Search** for an available [business name](https://example.com).",
  });

  expect(normalized).toBe("Search for an available business name.");
};

/**
 * Verifies generated records cover the current routed pages.
 */
const shouldBuildSearchIndexPages = () => {
  const pages = buildSearchIndexPages({
    locale: "en-US",
    loadedLandingContent: LOADED_LANDING_CONTENT,
    businessNamesPage: createBusinessNamesPage(),
    fundings: [createFunding()],
  });

  expect(pages).toHaveLength(2);
  expect(pages[0]?.url).toBe("/en-US");
  expect(pages[1]?.url).toBe("/en-US/business-names");
  expect(
    pages[0]?.sections.some((section) => section.paragraphs.join(" ").includes("Funding")),
  ).toBe(true);
};

/**
 * Verifies CMS content page records keep title and section context.
 */
const shouldBuildContentPageSearchIndexPage = () => {
  const page = buildContentPageSearchIndexPage({
    locale: "en-US",
    page: createBusinessNamesPage(),
  });

  expect(page.title).toBe("Business Names");
  expect(page.sections[0]?.id).toBe("business-names-title");
  expect(page.sections[1]?.id).toBe("business-names-section-2");
  expect(page.sections[1]?.paragraphs[0]).toBe("Search for an available business name.");
};

/**
 * Verifies generated HTML escapes CMS text before Pagefind indexes it.
 */
const shouldRenderEscapedSearchIndexHtml = () => {
  const html = renderSearchIndexHtml({
    page: {
      url: "/en-US/example",
      title: "Business <Names>",
      description: "A & B",
      locale: "en-US",
      sections: [
        {
          id: "example-title",
          headingLevel: 1,
          title: "Business <Names>",
          paragraphs: ["Use A & B together."],
        },
      ],
    },
  });

  expect(html).toContain("Business &lt;Names&gt;");
  expect(html).toContain("A &amp; B");
};

describe("search index page builder", () => {
  it("normalizes markdown-like text", shouldNormalizeMarkdownText);
  it("builds search-index pages for routed content", shouldBuildSearchIndexPages);
  it(
    "builds a CMS content page record with section anchors",
    shouldBuildContentPageSearchIndexPage,
  );
  it("renders escaped search-index HTML", shouldRenderEscapedSearchIndexHtml);
});
