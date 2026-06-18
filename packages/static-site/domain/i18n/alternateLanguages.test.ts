import { afterEach, describe, expect, it, vi } from "vitest";

import { buildAlternateLanguages } from "./alternateLanguages";

describe("alternateLanguages", () => {
  describe("buildAlternateLanguages", () => {
    it("builds canonical and hreflang entries for the root path", () => {
      const alternates = buildAlternateLanguages({ pathnameWithoutLocale: "/" });

      expect(alternates.canonical).toBe("/");
      expect(alternates.languages).toEqual({
        "en-US": "/",
        "es-US": "/es-US",
        "x-default": "/",
      });
    });

    it("builds canonical and hreflang entries for a nested path", () => {
      const alternates = buildAlternateLanguages({ pathnameWithoutLocale: "/pages/foo" });

      expect(alternates.canonical).toBe("/pages/foo");
      expect(alternates.languages).toEqual({
        "en-US": "/pages/foo",
        "es-US": "/es-US/pages/foo",
        "x-default": "/pages/foo",
      });
    });
  });
});

describe("alternateLanguages with multilingual disabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("emits only en-US and x-default when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { buildAlternateLanguages: build } = await import("./alternateLanguages");
    const alternates = build({ pathnameWithoutLocale: "/learn" });

    expect(Object.keys(alternates.languages ?? {})).toEqual(["en-US", "x-default"]);
    expect(alternates.languages?.["es-US"]).toBeUndefined();
  });
});
