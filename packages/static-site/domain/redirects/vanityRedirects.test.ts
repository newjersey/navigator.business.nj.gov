import { describe, expect, it } from "vitest";
import { buildVanityRedirects, type VanityRedirect } from "./vanityRedirects";

const find = (rules: VanityRedirect[], source: string): VanityRedirect | undefined =>
  rules.find((r) => r.source === source);

describe("buildVanityRedirects — /housingprograms", () => {
  it("routes /housingprograms to the housing developer resources page with a permanent 308", () => {
    const rule = find(
      buildVanityRedirects({ housingDeveloperResourcesEnabled: true }),
      "/housingprograms",
    );
    expect(rule).toEqual({
      source: "/housingprograms",
      destination: "/pages/housing-developer-resources",
      permanent: true,
    });
  });

  it("omits /housingprograms when the housing developer resources flag is disabled", () => {
    const rule = find(
      buildVanityRedirects({ housingDeveloperResourcesEnabled: false }),
      "/housingprograms",
    );
    expect(rule).toBeUndefined();
  });

  it("emits no /es-us twin (the legacy table owns Spanish routes)", () => {
    const rules = buildVanityRedirects({ housingDeveloperResourcesEnabled: true });
    expect(rules.filter((r) => r.source.startsWith("/es-us"))).toHaveLength(0);
  });
});

describe("buildVanityRedirects — table invariants", () => {
  it("uses permanent: true (308) on every rule and never sets statusCode", () => {
    for (const rule of buildVanityRedirects({ housingDeveloperResourcesEnabled: true })) {
      expect(rule.permanent).toBe(true);
      expect(rule).not.toHaveProperty("statusCode");
    }
  });

  it("never emits a source that matches its own destination (no loop)", () => {
    for (const rule of buildVanityRedirects({ housingDeveloperResourcesEnabled: true })) {
      expect(rule.destination).not.toBe(rule.source);
    }
  });
});
