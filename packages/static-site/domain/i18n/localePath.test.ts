import { afterEach, describe, expect, it, vi } from "vitest";

import { addLocalePrefix, localeOfPathname, stripLocalePrefix } from "./localePath";

describe("localePath", () => {
  describe("stripLocalePrefix", () => {
    it("removes a non-default locale prefix", () => {
      expect(stripLocalePrefix("/es-US/learn")).toBe("/learn");
    });

    it("reduces a bare locale prefix to root", () => {
      expect(stripLocalePrefix("/es-US")).toBe("/");
    });

    it("leaves an unprefixed pathname unchanged", () => {
      expect(stripLocalePrefix("/learn")).toBe("/learn");
    });

    it("leaves the default locale segment intact when it is real content", () => {
      expect(stripLocalePrefix("/learn/plan")).toBe("/learn/plan");
    });
  });

  describe("addLocalePrefix", () => {
    it("keeps the default locale unprefixed", () => {
      expect(addLocalePrefix({ pathnameWithoutLocale: "/learn", locale: "en-US" })).toBe("/learn");
    });

    it("prefixes a non-default locale", () => {
      expect(addLocalePrefix({ pathnameWithoutLocale: "/learn", locale: "es-US" })).toBe(
        "/es-US/learn",
      );
    });

    it("prefixes the root path without a trailing slash", () => {
      expect(addLocalePrefix({ pathnameWithoutLocale: "/", locale: "es-US" })).toBe("/es-US");
    });
  });

  describe("round-trip", () => {
    it("add after strip restores the non-default locale form", () => {
      const external = "/es-US/learn/plan";
      const restored = addLocalePrefix({
        pathnameWithoutLocale: stripLocalePrefix(external),
        locale: "es-US",
      });

      expect(restored).toBe(external);
    });
  });

  describe("localeOfPathname", () => {
    it("reads a non-default locale from the prefix", () => {
      expect(localeOfPathname("/es-US/learn")).toBe("es-US");
    });

    it("defaults to en-US when unprefixed", () => {
      expect(localeOfPathname("/learn")).toBe("en-US");
    });
  });
});

describe("localeOfPathname with multilingual disabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns en-US for /es-US/learn when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { localeOfPathname: localeOf } = await import("./localePath");
    expect(localeOf("/es-US/learn")).toBe("en-US");
  });
});
