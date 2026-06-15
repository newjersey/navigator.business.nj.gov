import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";

import { LANGUAGE_DESCRIPTORS, type LanguageDescriptor } from "@/domain/i18n/languages";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Describes input for rendering the switcher in a given locale context.
 */
interface RenderSwitcherParams {
  /** Locale used to source switcher chrome and mark the active option. */
  readonly currentLocale: AppLocale;
  /** Pathname the options should re-target. */
  readonly pathname: string;
  /** Optional override for the languages offered, for count-specific tests. */
  readonly descriptors?: readonly LanguageDescriptor[];
}

/**
 * Builds a list of synthetic descriptors of a given length.
 *
 * The switcher is stateless and renders whatever descriptors it is given, so
 * count/order behavior can be tested independently of the app's real language
 * set. The synthetic `locale` values are display-only here, so they are cast to
 * satisfy the descriptor type.
 */
const buildSyntheticDescriptors = (count: number): readonly LanguageDescriptor[] => {
  return Array.from({ length: count }, (_unused, index) => {
    return {
      locale: `synthetic-${index}` as AppLocale,
      nativeName: `Language ${index + 1}`,
      englishName: `Language ${index + 1}`,
      regionName: "United States",
      textDirection: "ltr",
    } satisfies LanguageDescriptor;
  });
};

/**
 * Renders the language switcher with localized chrome for one locale.
 */
const renderSwitcher = ({ currentLocale, pathname, descriptors }: RenderSwitcherParams) => {
  const messages = getApplicationMessages({ locale: currentLocale });

  return render(
    <LanguageSwitcher
      buttonLabel={messages.layout.languageSwitcher.buttonLabel}
      currentLanguageLabel={messages.layout.languageSwitcher.currentLanguageLabel}
      currentLocale={currentLocale}
      descriptors={descriptors}
      navigationAriaLabel={messages.layout.languageSwitcher.navigationAriaLabel}
      pathname={pathname}
    />,
  );
};

describe("LanguageSwitcher", () => {
  it("renders the trigger button with the button label", () => {
    renderSwitcher({ currentLocale: "en-US", pathname: "/learn" });

    expect(screen.getByRole("button", { name: "Languages" })).toBeInTheDocument();
  });

  it("renders one link per descriptor in the submenu", () => {
    const { container } = renderSwitcher({ currentLocale: "es-US", pathname: "/learn" });

    const links = container.querySelectorAll(".usa-language__submenu a");

    expect(links).toHaveLength(LANGUAGE_DESCRIPTORS.length);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/learn");
    }
  });

  it("marks the active locale option with aria-current and a hidden label", () => {
    const { currentLanguageLabel } = getApplicationMessages({
      locale: "es-US",
    }).layout.languageSwitcher;
    const { container } = renderSwitcher({ currentLocale: "es-US", pathname: "/learn" });

    const activeLink = container.querySelector('a[aria-current="true"]');

    expect(activeLink).not.toBeNull();
    expect(activeLink).toHaveAttribute("hreflang", "es-US");
    expect(
      within(activeLink as HTMLElement).getByText(currentLanguageLabel, { exact: false }),
    ).toBeInTheDocument();
  });

  it("shows native name in bold and English name in parentheses for non-English locales", () => {
    const { container } = renderSwitcher({ currentLocale: "en-US", pathname: "/learn" });

    const spanishLink = container.querySelector('a[hreflang="es-US"]');
    expect(spanishLink).not.toBeNull();
    expect(spanishLink?.querySelector("strong")?.textContent).toBe("Español");
    expect(spanishLink?.textContent).toContain("(Spanish)");
  });

  it("scopes the lang attribute to the native-name span, not the whole link", () => {
    // WCAG H58: only the foreign-language native name is marked with lang.
    const { container } = renderSwitcher({ currentLocale: "en-US", pathname: "/learn" });

    const spanishLink = container.querySelector('a[hreflang="es-US"]');
    expect(spanishLink).not.toBeNull();
    expect(spanishLink).not.toHaveAttribute("lang");
    expect(spanishLink?.querySelector("strong")).toHaveAttribute("lang", "es-US");
  });

  it("renders options ordered alphabetically by native name", () => {
    const { container } = renderSwitcher({ currentLocale: "en-US", pathname: "/learn" });

    const renderedNatives = Array.from(
      container.querySelectorAll(".usa-language__submenu a strong"),
    ).map((strong) => strong.textContent);
    const expectedOrder = LANGUAGE_DESCRIPTORS.map((descriptor) => descriptor.nativeName);

    expect(renderedNatives).toEqual(expectedOrder);
  });

  describe("option counts", () => {
    // jsdom has no layout engine, so scrollbar presence is asserted in the e2e
    // suite; here we only verify the correct options render for each count.
    // Counts use synthetic descriptors so they stay independent of the app's
    // actual supported languages.
    it("renders exactly two options when given two descriptors", () => {
      const twoLanguages = buildSyntheticDescriptors(2);
      const { container } = renderSwitcher({
        currentLocale: "en-US",
        pathname: "/learn",
        descriptors: twoLanguages,
      });

      const links = container.querySelectorAll(".usa-language__submenu a");

      expect(links).toHaveLength(2);
      for (const descriptor of twoLanguages) {
        expect(container.querySelector(`a[hreflang="${descriptor.locale}"]`)).not.toBeNull();
      }
    });

    it("renders exactly six options when given six descriptors", () => {
      const sixLanguages = buildSyntheticDescriptors(6);
      const { container } = renderSwitcher({
        currentLocale: "en-US",
        pathname: "/learn",
        descriptors: sixLanguages,
      });

      const links = container.querySelectorAll(".usa-language__submenu a");

      expect(links).toHaveLength(6);
      for (const descriptor of sixLanguages) {
        expect(container.querySelector(`a[hreflang="${descriptor.locale}"]`)).not.toBeNull();
      }
    });

    it("renders one option per descriptor when given more than six", () => {
      const manyLanguages = buildSyntheticDescriptors(8);
      const { container } = renderSwitcher({
        currentLocale: "en-US",
        pathname: "/learn",
        descriptors: manyLanguages,
      });

      const links = container.querySelectorAll(".usa-language__submenu a");

      expect(links.length).toBeGreaterThan(6);
      expect(links).toHaveLength(manyLanguages.length);
    });
  });

  it("passes automated accessibility checks for both locales", async () => {
    const englishView = renderSwitcher({ currentLocale: "en-US", pathname: "/learn" });
    const englishResults = await axe.run(englishView.container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(englishResults.violations).toHaveLength(0);
    englishView.unmount();

    const spanishView = renderSwitcher({ currentLocale: "es-US", pathname: "/learn" });
    const spanishResults = await axe.run(spanishView.container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(spanishResults.violations).toHaveLength(0);
  });
});
