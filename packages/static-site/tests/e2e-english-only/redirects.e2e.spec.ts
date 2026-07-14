import { expect, test } from "@playwright/test";

/**
 * Verifies legacy Webflow URLs redirect to real new-site pages when
 * NEXT_PUBLIC_MULTILINGUAL_ENABLED is false. Each case follows the redirect and
 * asserts the final page is 200, not another 404. Also asserts a deliberately
 * skipped legacy path still 404s (the "404 as signal" set).
 */

// A real published recents slug — becomes /updates/<slug>.
const PUBLISHED_UPDATE_SLUG = "new-jersey-liquor-license-transfer-a-guide-for-license-holders";

test.describe("Legacy redirects (English-only mode)", () => {
  test("/recent redirects to /updates", async ({ page }) => {
    const response = await page.goto("/recent");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/updates");
  });

  test("/recent/<slug> preserves the slug to /updates/<slug>", async ({ page }) => {
    const response = await page.goto(`/recent/${PUBLISHED_UPDATE_SLUG}`);
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(`/updates/${PUBLISHED_UPDATE_SLUG}`);
  });

  test("/license/<anything> aggregates to the licensing guide", async ({ page }) => {
    const response = await page.goto("/license/acupuncture-license");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/pages/licensing-and-certification-guide");
  });

  test("/es-us/license/<anything> aggregates to the English guide (flag off)", async ({ page }) => {
    const response = await page.goto("/es-us/license/acupuncture-license");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/pages/licensing-and-certification-guide");
  });

  test("/category/grow redirects to the /grow hub", async ({ page }) => {
    const response = await page.goto("/category/grow");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/grow");
  });

  test("/covid19 redirects to /pages/covid19", async ({ page }) => {
    const response = await page.goto("/covid19");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/pages/covid19");
  });

  test("a deliberately skipped legacy path still 404s", async ({ page }) => {
    const response = await page.goto("/search");
    expect(response?.status()).toBe(404);
  });
});
