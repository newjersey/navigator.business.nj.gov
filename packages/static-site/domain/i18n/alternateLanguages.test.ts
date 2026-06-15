import { describe, expect, it } from "vitest";

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
