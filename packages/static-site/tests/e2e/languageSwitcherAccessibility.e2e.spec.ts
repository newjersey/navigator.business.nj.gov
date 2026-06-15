import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { LANGUAGE_DESCRIPTORS } from "@/domain/i18n/languages";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";

/**
 * Verifies the screen-reader contract of the language switcher: the trigger
 * advertises its expanded state, it points at the submenu it controls, each
 * option carries its BCP-47 `lang`/`hreflang`, the active option is marked with
 * `aria-current`, and the open dropdown has no automated WCAG violations.
 */

const TRIGGER = "nav.usa-language button.usa-language__link";
const SUBMENU = "#language-switcher-submenu";

test.describe("language switcher accessibility", () => {
  test.beforeEach(async ({ context }) => {
    // Suppress the preferred-language prompt modal, whose overlay would
    // otherwise intercept clicks on the switcher when the browser locale
    // differs from the page locale.
    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3100",
      },
    ]);
  });

  test("trigger exposes aria-controls pointing at the submenu", async ({ page }) => {
    await page.goto("/learn");

    const controls = await page.locator(TRIGGER).getAttribute("aria-controls");
    expect(controls).toBe("language-switcher-submenu");
    await expect(page.locator(`#${controls}`)).toHaveCount(1);
  });

  test("trigger toggles aria-expanded between collapsed and expanded", async ({ page }) => {
    await page.goto("/learn");
    const trigger = page.locator(TRIGGER);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("the language navigation region has an accessible label", async ({ page }) => {
    const { navigationAriaLabel } = getApplicationMessages({
      locale: "en-US",
    }).layout.languageSwitcher;

    await page.goto("/learn");

    await expect(page.locator("nav.usa-language")).toHaveAttribute(
      "aria-label",
      navigationAriaLabel,
    );
  });

  test("each option declares hreflang on the link and lang on its native-name span", async ({
    page,
  }) => {
    await page.goto("/learn");
    await page.locator(TRIGGER).click();

    for (const descriptor of LANGUAGE_DESCRIPTORS) {
      const option = page.locator(`${SUBMENU} a[hreflang="${descriptor.locale}"]`);
      await expect(option).toBeVisible();
      // WCAG H58: lang scopes to the foreign-language native name, not the link.
      await expect(option).not.toHaveAttribute("lang", /.+/);
      await expect(option.locator("strong")).toHaveAttribute("lang", descriptor.locale);
    }
  });

  test("orders options alphabetically by native name", async ({ page }) => {
    await page.goto("/learn");
    await page.locator(TRIGGER).click();

    const renderedNatives = await page.locator(`${SUBMENU} a strong`).allTextContents();
    const expectedOrder = LANGUAGE_DESCRIPTORS.map((descriptor) => descriptor.nativeName);

    expect(renderedNatives).toEqual(expectedOrder);
  });

  test("marks the active locale option with aria-current", async ({ page }) => {
    await page.goto("/es-US/learn");
    await page.locator(TRIGGER).click();

    const current = page.locator(`${SUBMENU} a[aria-current="true"]`);
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute("hreflang", "es-US");
  });

  test("open dropdown has no automated WCAG violations", async ({ page }) => {
    await page.goto("/learn");
    await page.locator(TRIGGER).click();
    await expect(page.locator(SUBMENU)).toBeVisible();

    const results = await new AxeBuilder({ page }).include("nav.usa-language").analyze();

    expect(results.violations).toEqual([]);
  });
});
