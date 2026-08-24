import { expect, test } from "@playwright/test";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";

interface AnalyticsEvent {
  readonly click_text: string;
  readonly event: "all_elements_clicked";
}

const GTM_SCRIPT_URL = "https://www.googletagmanager.com/gtm.js";
const ANALYTICS_COLLECTOR_URL = "https://analytics.test/collect";

/**
 * Mimics the relevant GTM click handler without loading the mutable production
 * container. It emits the clicked Quick Services link's DOM text to a test-only
 * collector and prevents the internal link from navigating away before the
 * assertion can observe the request.
 */
const mockGtmContainer = `
document.addEventListener("click", function(event) {
  var target = event.target;
  if (!(target instanceof Element)) return;

  var link = target.closest("a.quick-service-card__link");
  if (!link) return;

  event.preventDefault();
  void fetch("${ANALYTICS_COLLECTOR_URL}", {
    method: "POST",
    body: JSON.stringify({
      event: "all_elements_clicked",
      click_text: link.textContent.trim()
    })
  });
});
`;

test.describe("Quick Services analytics", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3100",
      },
    ]);

    await page.route(`${GTM_SCRIPT_URL}*`, async (route) => {
      await route.fulfill({
        body: mockGtmContainer,
        contentType: "application/javascript",
      });
    });
  });

  test("sends only the service title when its description area is clicked", async ({ page }) => {
    const [quickService] = getApplicationMessages({ locale: "en-US" }).landing.quickServices.items;
    const analyticsEvents: AnalyticsEvent[] = [];

    await page.route(ANALYTICS_COLLECTOR_URL, async (route) => {
      const payload = route.request().postData();

      if (!payload) {
        throw new Error("Expected the mocked GTM container to send an analytics payload.");
      }

      analyticsEvents.push(JSON.parse(payload) as AnalyticsEvent);
      await route.fulfill({ status: 204 });
    });

    await page.goto("/");

    const link = page.getByRole("link", { name: quickService.title });
    const card = page.locator(".quick-service-card").filter({ has: link });
    const description = card.getByText(quickService.description, { exact: true });

    const [cardBox, descriptionBox] = await Promise.all([
      card.boundingBox(),
      description.boundingBox(),
    ]);

    if (!cardBox || !descriptionBox) {
      throw new Error("Expected the Quick Services card and description to have visible bounds.");
    }

    await card.click({
      position: {
        x: descriptionBox.x - cardBox.x + descriptionBox.width / 2,
        y: descriptionBox.y - cardBox.y + descriptionBox.height / 2,
      },
    });

    await expect
      .poll(() => analyticsEvents)
      .toEqual([
        {
          event: "all_elements_clicked",
          click_text: quickService.title,
        },
      ]);
  });
});
