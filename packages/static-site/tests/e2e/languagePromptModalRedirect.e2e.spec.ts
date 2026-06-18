import { expect, test } from "@playwright/test";

/**
 * Verifies that switching language from the preferred-language *modal* loads the
 * destination page cleanly. The modal-driven switch is a distinct code path from
 * the header switcher: the open NJWDS modal hoists its DOM node to <body>, so a
 * client-side router transition would unmount a node React no longer owns and
 * trip the framework error boundary. This suite guards against that regression
 * by asserting the destination renders real content, not the error screen.
 */

const MODAL = "#language-prompt-modal";

// Force a browser language that differs from the visited (es-US) page so the
// preferred-language modal opens on load.
test.use({ locale: "en-US" });

test.describe("language prompt modal redirect", () => {
  test("switching to English from the modal loads the page without an error boundary", async ({
    page,
  }) => {
    await page.goto("/es-US/plan");

    await expect(page.locator(MODAL)).toBeVisible();
    await page.locator(`${MODAL} button`, { hasText: "Switch to English" }).click();

    await expect(page).toHaveURL(/\/plan$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
    await expect(page.getByRole("heading", { level: 1, name: "Plan" })).toBeVisible();
    await expect(page.getByText(/couldn’t load/i)).toHaveCount(0);
  });
});
