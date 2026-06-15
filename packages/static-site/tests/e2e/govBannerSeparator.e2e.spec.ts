import { expect, test } from "@playwright/test";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";

/**
 * Verifies the gov-banner item separator renders on the inline-end edge under
 * LTR. The separator is a logical-property border (nj-rtl-utilities.css) that
 * also resets NJWDS's physical right edge; an earlier version applied both in
 * one rule and the reset clobbered the border in LTR, dropping the divider.
 * Asserts computed styles in a real browser at the default (en-US) route.
 */

const SEPARATOR_ITEMS = ".nj-inline-separators > li";

test.describe("gov banner separator", () => {
  test.beforeEach(async ({ context }) => {
    // Suppress the preferred-language prompt modal so its overlay never covers
    // the banner these assertions read.
    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3100",
      },
    ]);
  });

  test("renders the separator on the inline-end edge under LTR", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto("/learn");

    const items = page.locator(SEPARATOR_ITEMS);
    await expect(items.first()).toBeVisible();

    // Non-final item: under LTR the inline-end edge is the physical right.
    const firstBorder = await items.first().evaluate((el) => {
      const style = getComputedStyle(el);
      return { left: style.borderLeftWidth, right: style.borderRightWidth };
    });
    expect(firstBorder.right).toBe("1px");
    expect(firstBorder.left).toBe("0px");

    // Final item drops the separator on both edges.
    const lastBorder = await items.last().evaluate((el) => {
      const style = getComputedStyle(el);
      return { left: style.borderLeftWidth, right: style.borderRightWidth };
    });
    expect(lastBorder.right).toBe("0px");
    expect(lastBorder.left).toBe("0px");
  });
});
