import { afterEach, describe, expect, it, vi } from "vitest";

import { resolvePreferredLocale } from "./preferredLocale";

describe("preferredLocale", () => {
  describe("resolvePreferredLocale", () => {
    it("maps a regional Spanish tag to es-US", () => {
      expect(resolvePreferredLocale({ browserLanguages: ["es-US", "es"] })).toBe("es-US");
    });

    it("maps a bare Spanish subtag to es-US", () => {
      expect(resolvePreferredLocale({ browserLanguages: ["es"] })).toBe("es-US");
    });

    it("maps a non-US English variant to en-US", () => {
      expect(resolvePreferredLocale({ browserLanguages: ["en-GB"] })).toBe("en-US");
    });

    it("returns undefined for an unsupported language", () => {
      expect(resolvePreferredLocale({ browserLanguages: ["fr"] })).toBeUndefined();
    });

    it("returns undefined for an empty list", () => {
      expect(resolvePreferredLocale({ browserLanguages: [] })).toBeUndefined();
    });

    it("returns the first supported match over later entries", () => {
      expect(resolvePreferredLocale({ browserLanguages: ["fr", "es", "en"] })).toBe("es-US");
    });
  });
});

describe("resolvePreferredLocale with multilingual disabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns undefined for Spanish browser language when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { resolvePreferredLocale: resolve } = await import("./preferredLocale");
    expect(resolve({ browserLanguages: ["es-ES"] })).toBeUndefined();
  });

  it("still returns en-US for English browser language when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { resolvePreferredLocale: resolve } = await import("./preferredLocale");
    expect(resolve({ browserLanguages: ["en-GB"] })).toBe("en-US");
  });
});
