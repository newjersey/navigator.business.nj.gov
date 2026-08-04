import { describe, expect, it } from "vitest";

import { loadPageBySlug } from "@/domain/content/loadContent";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { resolvePageTitle } from "./resolvePageTitle";

describe("resolvePageTitle", () => {
  it("uses the locale-specific message title for the funding page", () => {
    const page = loadPageBySlug("funding");

    expect(resolvePageTitle({ page, messages: getApplicationMessages({ locale: "en-US" }) })).toBe(
      "Funding",
    );
    expect(resolvePageTitle({ page, messages: getApplicationMessages({ locale: "es-US" }) })).toBe(
      "Financiamiento",
    );
  });

  it("uses the locale-specific message title for the licensing guide page", () => {
    const page = loadPageBySlug("licensing-and-certification-guide");

    expect(resolvePageTitle({ page, messages: getApplicationMessages({ locale: "en-US" }) })).toBe(
      "Licensing and Certification Guide",
    );
    expect(resolvePageTitle({ page, messages: getApplicationMessages({ locale: "es-US" }) })).toBe(
      "Guía de Licencias y Certificaciones",
    );
  });

  it("falls back to the page's own name for every other slug", () => {
    const page = loadPageBySlug("government-contracting");

    expect(resolvePageTitle({ page, messages: getApplicationMessages({ locale: "en-US" }) })).toBe(
      page.name,
    );
  });

  it("falls back to the page's own name for the starter-kits page, which PageSwitchComponent also special-cases", () => {
    const page = loadPageBySlug("starter-kits");

    expect(resolvePageTitle({ page, messages: getApplicationMessages({ locale: "en-US" }) })).toBe(
      page.name,
    );
  });
});
