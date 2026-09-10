import { expect, test } from "@playwright/test";
import { getApplicationMessages } from "@/domain/i18n/messages";

/**
 * Confirms the search feature is fully absent when
 * `NEXT_PUBLIC_SEARCH_ENABLED` is off. Runs against
 * `playwright.e2e.config.ts`'s dev server, which does not set this flag, so
 * it is unset/false here exactly like a real build that never opted in.
 */

test.describe("search feature flag off", () => {
  test("the header renders no search entry point", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("search")).toHaveCount(0);
    await expect(page.getByRole("searchbox")).toHaveCount(0);
  });

  test("/search 404s", async ({ page }) => {
    const { pageNotFound } = getApplicationMessages({ locale: "en-US" });

    const response = await page.goto("/search");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: pageNotFound.title })).toBeVisible();
  });

  test("/es-US/search 404s", async ({ page }) => {
    const { pageNotFound } = getApplicationMessages({ locale: "es-US" });

    const response = await page.goto("/es-US/search");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: pageNotFound.title })).toBeVisible();
  });
});
