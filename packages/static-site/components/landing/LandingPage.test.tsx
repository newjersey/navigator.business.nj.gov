import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import type { AppLocale } from "@/domain/i18n/locales";
import { loadLandingContentFromMessages } from "@/domain/landing/loadLandingContent";
import { LandingPage } from "./LandingPage";

/**
 * Parameters for rendering one locale-specific landing page.
 */
interface RenderLandingPageForLocaleParams {
  /** Locale used to select localized page content. */
  readonly locale: AppLocale;
}

/**
 * Parameters required to count secondary navigation items.
 */
interface CountSecondaryNavigationItemsParams {
  /** Rendered page container queried for navigation items. */
  readonly container: HTMLElement;
}

/**
 * Counts rendered secondary navigation list items.
 */
const countSecondaryNavigationItems = ({
  container,
}: CountSecondaryNavigationItemsParams): number => {
  return container.querySelectorAll(".usa-nav__secondary-item").length;
};

/**
 * Escapes a string value for safe regular-expression usage.
 */
const escapeRegularExpressionValue = (value: string): string => {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Renders the landing page for a specific locale.
 */
const renderLandingPageForLocale = async ({ locale }: RenderLandingPageForLocaleParams) => {
  const loadedLandingContent = await loadLandingContentFromMessages({ locale });

  return {
    ...render(<LandingPage content={loadedLandingContent.landing} />),
    content: loadedLandingContent.landing,
  };
};

/**
 * Verifies banner government identity appears and placeholder header links are absent.
 */
const shouldRenderGovernmentIdentityDetails = async () => {
  const englishPage = await renderLandingPageForLocale({ locale: "en-US" });
  const englishGovernorName = englishPage.content.banner.governorIdentityLink.label;
  const englishGovernorLink = screen.getByRole("link", { name: englishGovernorName });
  const englishSecondaryNavigationItemCount = countSecondaryNavigationItems({
    container: englishPage.container,
  });

  expect(englishGovernorLink).toBeTruthy();
  expect(englishSecondaryNavigationItemCount).toBe(
    englishPage.content.header.secondaryLinks.length,
  );
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(screen.queryByText("Secondary link")).toBeNull();
  expect(screen.queryByText("Another secondary link")).toBeNull();
  expect(
    screen.getByRole("link", { name: englishPage.content.banner.updatesLink.label }),
  ).toBeTruthy();

  englishPage.unmount();

  const spanishPage = await renderLandingPageForLocale({ locale: "es-US" });
  const spanishGovernorName = spanishPage.content.banner.governorIdentityLink.label;
  const spanishGovernorLink = screen.getByRole("link", { name: spanishGovernorName });
  const spanishSecondaryNavigationItemCount = countSecondaryNavigationItems({
    container: spanishPage.container,
  });

  expect(spanishGovernorLink).toBeTruthy();
  expect(spanishSecondaryNavigationItemCount).toBe(
    spanishPage.content.header.secondaryLinks.length,
  );
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(screen.queryByText("Enlace secundario")).toBeNull();
  expect(screen.queryByText("Otro enlace secundario")).toBeNull();
  expect(
    screen.getByRole("link", { name: spanishPage.content.banner.updatesLink.label }),
  ).toBeTruthy();
};

/**
 * Verifies key section headings render with locale-specific content.
 */
const shouldRenderKeyLandingSections = async () => {
  const englishPage = await renderLandingPageForLocale({ locale: "en-US" });
  const englishHeroTitlePattern = new RegExp(
    escapeRegularExpressionValue(englishPage.content.hero.title),
    "i",
  );

  const englishHeroHeading = screen.getByRole("heading", {
    name: englishHeroTitlePattern,
    level: 1,
  });
  const englishTaglineHeading = screen.getByRole("heading", {
    name: englishPage.content.tagline.title,
    level: 2,
  });

  expect(englishHeroHeading).toBeTruthy();
  expect(englishTaglineHeading).toBeTruthy();

  englishPage.unmount();

  const spanishPage = await renderLandingPageForLocale({ locale: "es-US" });
  const spanishHeroTitlePattern = new RegExp(
    escapeRegularExpressionValue(spanishPage.content.hero.title),
    "i",
  );

  const spanishHeroHeading = screen.getByRole("heading", {
    name: spanishHeroTitlePattern,
    level: 1,
  });
  const spanishTaglineHeading = screen.getByRole("heading", {
    name: spanishPage.content.tagline.title,
    level: 2,
  });

  expect(spanishHeroHeading).toBeTruthy();
  expect(spanishTaglineHeading).toBeTruthy();
};

/**
 * Verifies the landing page passes jsdom-based axe checks for both locales.
 */
const shouldPassAxeAudit = async () => {
  const englishPage = await renderLandingPageForLocale({ locale: "en-US" });

  const englishAxeResults = await axe.run(englishPage.container, {
    rules: {
      "color-contrast": {
        enabled: false,
      },
    },
  });

  expect(englishAxeResults.violations).toHaveLength(0);

  englishPage.unmount();

  const spanishPage = await renderLandingPageForLocale({ locale: "es-US" });

  const spanishAxeResults = await axe.run(spanishPage.container, {
    rules: {
      "color-contrast": {
        enabled: false,
      },
    },
  });

  expect(spanishAxeResults.violations).toHaveLength(0);
};

/**
 * Defines the landing-page component test suite.
 */
const runLandingPageSuite = () => {
  it("renders required government identity content", shouldRenderGovernmentIdentityDetails);
  it("renders key landing sections", shouldRenderKeyLandingSections);
  it("passes automated accessibility checks", shouldPassAxeAudit);
};

describe("Landing page component", runLandingPageSuite);
