import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { LandingPage } from "./LandingPage";

/**
 * Parameters for rendering one locale-specific landing page.
 */
interface RenderLandingPageForLocaleParams {
  /** Locale used to select localized page content. */
  readonly locale: AppLocale;
}

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
  const messages = await getApplicationMessages({ locale });

  return {
    ...render(<LandingPage content={messages.landing} />),
    content: messages,
  };
};

/**
 * Verifies key section headings render with locale-specific content.
 */
const shouldRenderKeyLandingSections = async () => {
  const englishPage = await renderLandingPageForLocale({ locale: "en-US" });
  const englishHeroTitlePattern = new RegExp(
    escapeRegularExpressionValue(englishPage.content.landing.hero.title),
    "i",
  );

  const englishHeroHeading = screen.getByRole("heading", {
    name: englishHeroTitlePattern,
    level: 1,
  });
  const englishTaglineHeading = screen.getByRole("heading", {
    name: englishPage.content.landing.tagline.title,
    level: 2,
  });

  expect(englishHeroHeading).toBeTruthy();
  expect(englishTaglineHeading).toBeTruthy();

  englishPage.unmount();

  const spanishPage = await renderLandingPageForLocale({ locale: "es-US" });
  const spanishHeroTitlePattern = new RegExp(
    escapeRegularExpressionValue(spanishPage.content.landing.hero.title),
    "i",
  );

  const spanishHeroHeading = screen.getByRole("heading", {
    name: spanishHeroTitlePattern,
    level: 1,
  });
  const spanishTaglineHeading = screen.getByRole("heading", {
    name: spanishPage.content.landing.tagline.title,
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
  it("renders key landing sections", shouldRenderKeyLandingSections);
  it("passes automated accessibility checks", shouldPassAxeAudit);
};

describe("Landing page component", runLandingPageSuite);
