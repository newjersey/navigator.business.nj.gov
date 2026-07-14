import { describe, expect, it } from "vitest";
import { buildLegacyRedirects, type LegacyRedirect } from "./legacyRedirects";

const find = (rules: LegacyRedirect[], source: string): LegacyRedirect | undefined =>
  rules.find((r) => r.source === source);

const indexOf = (rules: LegacyRedirect[], source: string): number =>
  rules.findIndex((r) => r.source === source);

describe("buildLegacyRedirects — starter-kit slugs land on the real page", () => {
  it("routes /starter-kits/:slug* straight to /pages/starter-kits (not the redirect-only /starter-kits)", () => {
    const rule = find(buildLegacyRedirects(false), "/starter-kits/:slug*");
    expect(rule?.destination).toBe("/pages/starter-kits");
  });

  it("never sends a starter-kit source to a destination that re-matches it (no loop)", () => {
    for (const rule of buildLegacyRedirects(false)) {
      if (rule.source.startsWith("/starter-kits")) {
        expect(rule.destination).not.toBe("/starter-kits");
      }
    }
  });
});

describe("buildLegacyRedirects — /recent topic-page one-offs win over the prefix", () => {
  it("routes /recent/disposable-bag-ban to the plastic-ban page, before the /recent prefix", () => {
    const rules = buildLegacyRedirects(false);
    expect(find(rules, "/recent/disposable-bag-ban")?.destination).toBe("/pages/plastic-ban-law");
    expect(indexOf(rules, "/recent/disposable-bag-ban")).toBeLessThan(
      indexOf(rules, "/recent/:slug*"),
    );
  });

  it("routes /recent/state-financial-assistance-programs to the covid19 page, before the prefix", () => {
    const rules = buildLegacyRedirects(false);
    expect(find(rules, "/recent/state-financial-assistance-programs")?.destination).toBe(
      "/pages/covid19",
    );
    expect(indexOf(rules, "/recent/state-financial-assistance-programs")).toBeLessThan(
      indexOf(rules, "/recent/:slug*"),
    );
  });
});

describe("buildLegacyRedirects — content-gap one-offs", () => {
  it("routes the covid workplace-standards page to /pages/covid19", () => {
    const rule = find(
      buildLegacyRedirects(false),
      "/pages/covid-19-required-workplace-health-and-safety-standards",
    );
    expect(rule?.destination).toBe("/pages/covid19");
  });

  it("routes the transferring-or-exiting page to /pages/closing-your-business", () => {
    const rule = find(buildLegacyRedirects(false), "/pages/transferring-or-exiting-your-business");
    expect(rule?.destination).toBe("/pages/closing-your-business");
  });
});

describe("buildLegacyRedirects — /page/* singular-prefix one-offs", () => {
  it("routes English /page/impactreport to /impact-report", () => {
    expect(find(buildLegacyRedirects(false), "/page/impactreport")?.destination).toBe(
      "/impact-report",
    );
  });

  it("routes English /page/trucking to /pages/starter-kits", () => {
    expect(find(buildLegacyRedirects(false), "/page/trucking")?.destination).toBe(
      "/pages/starter-kits",
    );
  });

  it("auto-generates the /es-us twins to the English page when the flag is OFF", () => {
    const rules = buildLegacyRedirects(false);
    expect(find(rules, "/es-us/page/impactreport")?.destination).toBe("/impact-report");
    expect(find(rules, "/es-us/page/trucking")?.destination).toBe("/pages/starter-kits");
  });

  it("auto-generates the /es-us twins to the /es-US page when the flag is ON", () => {
    const rules = buildLegacyRedirects(true);
    expect(find(rules, "/es-us/page/impactreport")?.destination).toBe("/es-US/impact-report");
    expect(find(rules, "/es-us/page/trucking")?.destination).toBe("/es-US/pages/starter-kits");
  });

  it("emits exactly one rule per /es-us/page source (no hand-written duplicate)", () => {
    const rules = buildLegacyRedirects(false);
    for (const source of ["/es-us/page/impactreport", "/es-us/page/trucking"]) {
      expect(rules.filter((r) => r.source === source)).toHaveLength(1);
    }
  });
});

describe("buildLegacyRedirects — prefix rules", () => {
  it("aggregates English /license/* to the licensing guide with a permanent 308", () => {
    const rules = buildLegacyRedirects(false);
    const rule = find(rules, "/license/:slug*");
    expect(rule).toEqual({
      source: "/license/:slug*",
      destination: "/pages/licensing-and-certification-guide",
      permanent: true,
    });
  });

  it("slug-preserves English /recent/* to /updates/*", () => {
    const rule = find(buildLegacyRedirects(false), "/recent/:slug*");
    expect(rule?.destination).toBe("/updates/:slug*");
  });

  it("aggregates English /funding/* to the funding page", () => {
    const rule = find(buildLegacyRedirects(false), "/funding/:slug*");
    expect(rule?.destination).toBe("/pages/funding");
  });

  it("every rule uses permanent: true (308) and never sets statusCode", () => {
    for (const rule of buildLegacyRedirects(false)) {
      expect(rule.permanent).toBe(true);
      expect(rule).not.toHaveProperty("statusCode");
    }
  });
});

describe("buildLegacyRedirects — Spanish routes (flag OFF)", () => {
  it("emits a lowercase /es-us route for /license/* pointing at the English destination", () => {
    const rule = find(buildLegacyRedirects(false), "/es-us/license/:slug*");
    expect(rule?.destination).toBe("/pages/licensing-and-certification-guide");
  });

  it("emits a lowercase /es-us route for /recent/* preserving slug to the English /updates", () => {
    const rule = find(buildLegacyRedirects(false), "/es-us/recent/:slug*");
    expect(rule?.destination).toBe("/updates/:slug*");
  });
});

describe("buildLegacyRedirects — Spanish routes (flag ON)", () => {
  it("routes the /es-us/license route to the /es-US locale destination", () => {
    const rule = find(buildLegacyRedirects(true), "/es-us/license/:slug*");
    expect(rule?.destination).toBe("/es-US/pages/licensing-and-certification-guide");
  });

  it("routes the /es-us/recent route to /es-US/updates/*", () => {
    const rule = find(buildLegacyRedirects(true), "/es-us/recent/:slug*");
    expect(rule?.destination).toBe("/es-US/updates/:slug*");
  });
});

describe("buildLegacyRedirects — blanket /es-us catch-all", () => {
  it("strips any unlisted /es-us path to its English equivalent when the flag is OFF", () => {
    const rule = find(buildLegacyRedirects(false), "/es-us/:path*");
    expect(rule?.destination).toBe("/:path*");
    expect(rule?.permanent).toBe(true);
  });

  it("emits NO /es-us path catch-all when the flag is ON (next-intl renders es-US, case-insensitive)", () => {
    const rule = find(buildLegacyRedirects(true), "/es-us/:path*");
    expect(rule).toBeUndefined();
  });

  it("redirects the bare /es-us root to the English root when the flag is OFF", () => {
    const rule = find(buildLegacyRedirects(false), "/es-us");
    expect(rule?.destination).toBe("/");
    expect(rule?.permanent).toBe(true);
  });

  it("does NOT redirect the bare /es-us root when the flag is ON (the Spanish page renders)", () => {
    const rule = find(buildLegacyRedirects(true), "/es-us");
    expect(rule).toBeUndefined();
  });

  it("orders the catch-all after every specific /es-us rule so specifics win", () => {
    const rules = buildLegacyRedirects(false);
    const catchAllIndex = rules.findIndex((r) => r.source === "/es-us/:path*");
    const lastSpecificIndex = rules.findLastIndex(
      (r) => r.source.startsWith("/es-us/") && r.source !== "/es-us/:path*",
    );
    expect(catchAllIndex).toBeGreaterThan(lastSpecificIndex);
  });
});

describe("buildLegacyRedirects — one-off internal rules", () => {
  it("maps /category/grow to the /grow hub with a Spanish route", () => {
    const rules = buildLegacyRedirects(false);
    expect(find(rules, "/category/grow")?.destination).toBe("/grow");
    expect(find(rules, "/es-us/category/grow")?.destination).toBe("/grow");
  });

  it("maps the whole covid cluster to /pages/covid19", () => {
    const rules = buildLegacyRedirects(false);
    for (const source of ["/covid", "/covid19", "/reopen", "/covid-19", "/covid-faqs"]) {
      expect(find(rules, source)?.destination).toBe("/pages/covid19");
    }
  });

  it("maps the lone /es/pages/funding legacy row to the funding page (no generated Spanish route)", () => {
    const rules = buildLegacyRedirects(false);
    expect(find(rules, "/es/pages/funding")?.destination).toBe("/pages/funding");
  });
});

describe("buildLegacyRedirects — starter-kit slugs", () => {
  it("collapses any starter-kit slug onto the on-site starter-kits page", () => {
    expect(find(buildLegacyRedirects(false), "/starter-kits/:slug*")?.destination).toBe(
      "/pages/starter-kits",
    );
  });

  it("routes the /es-us starter-kit slug to the /es-US page when multilingual is on", () => {
    expect(find(buildLegacyRedirects(true), "/es-us/starter-kits/:slug*")?.destination).toBe(
      "/es-US/pages/starter-kits",
    );
  });
});

describe("buildLegacyRedirects — one-off external rules", () => {
  it("does NOT locale-rewrite an external destination's Spanish route", () => {
    const rule = find(buildLegacyRedirects(true), "/es-us/panel");
    expect(rule?.destination).toBe("https://forms.business.nj.gov/panel/");
  });
});

describe("buildLegacyRedirects — impact report", () => {
  it("maps /impact to the on-site impact-report page", () => {
    expect(find(buildLegacyRedirects(false), "/impact")?.destination).toBe("/impact-report");
  });
});
