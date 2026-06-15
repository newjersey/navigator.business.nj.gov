import { expect, test } from "@playwright/test";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";

/**
 * Verifies that the RTL-aware utility classes correctly flip NJWDS's physical
 * directional layout under `dir="rtl"`, and that inherently-Latin strings stay
 * bidi-isolated. NJWDS ships no RTL support, so these flips come from our
 * flow-relative utilities (public/styles/nj-rtl-utilities.css) composed onto
 * the components. Assertions read computed styles in a real browser at the
 * Arabic (`ar-US`) route.
 */

const RTL_ROUTE = "/ar-US";
const TRIGGER = "nav.usa-language button.usa-language__link";
const SUBMENU = "#language-switcher-submenu";

// Skipped while no RTL locale ships: these assertions navigate to /ar-US, which
// is not a route until an RTL language is added back to APP_LOCALES. The RTL
// implementation they cover (the nj-rtl-utilities classes, bidi isolation, and
// the placeholder messages/ar-US.json) is intentionally kept in the tree, so
// re-enabling is just removing this `.skip` once ar-US is restored.
const describeRtlLayout = test.describe.skip;

describeRtlLayout("RTL layout", () => {
  test.beforeEach(async ({ context }) => {
    // Suppress the preferred-language prompt modal so its overlay never covers
    // the elements these assertions target.
    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3100",
      },
    ]);
  });

  test("renders the document right-to-left", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(RTL_ROUTE);

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("anchors the secondary nav to the inline-end so it does not overlap the title", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(RTL_ROUTE);

    const overlap = await page.evaluate(() => {
      const logo = document.querySelector(".usa-logo__text");
      const langButton = document.querySelector(".usa-language__link");
      if (!logo || !langButton) {
        return { found: false, overlapping: true };
      }
      const a = logo.getBoundingClientRect();
      const b = langButton.getBoundingClientRect();
      const overlapping = !(a.right <= b.left || b.right <= a.left);
      return { found: true, overlapping };
    });

    expect(overlap.found).toBe(true);
    expect(overlap.overlapping).toBe(false);
  });

  test("flips the gov banner item separators to the inline-end", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(RTL_ROUTE);

    const border = await page
      .locator(".nj-inline-separators > li")
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return { left: style.borderLeftWidth, right: style.borderRightWidth };
      });

    // Under RTL the inline-end edge is the physical left.
    expect(border.left).toBe("1px");
    expect(border.right).toBe("0px");
  });

  test("opens the language submenu from the inline-end edge", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(RTL_ROUTE);
    await page.locator(TRIGGER).click();
    await expect(page.locator(SUBMENU)).toBeVisible();

    const position = await page.locator(SUBMENU).evaluate((el) => {
      const style = getComputedStyle(el);
      return { left: style.left, insetInlineEnd: style.insetInlineEnd };
    });

    // inset-inline-end: 0 resolves to physical left: 0 under RTL (the browser
    // then derives `right` from left + width, so only `left` is asserted).
    expect(position.left).toBe("0px");
    expect(position.insetInlineEnd).toBe("0px");
  });

  test("bidi-isolates inherently-Latin strings", async ({ page }) => {
    await page.goto(RTL_ROUTE);

    const siteTitle = page.locator(".usa-logo__text bdi");
    await expect(siteTitle).toHaveAttribute("dir", "ltr");

    const domain = page.locator(".usa-identifier__identity-domain bdi");
    await expect(domain).toHaveAttribute("dir", "ltr");
  });
});
