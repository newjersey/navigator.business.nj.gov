import { afterEach, describe, expect, it, vi } from "vitest";

import {
  APP_LOCALES,
  computeEnabledLocales,
  DEFAULT_LOCALE,
  hasAppLocale,
  resolveAppLocale,
} from "./locales";

describe("computeEnabledLocales", () => {
  it("returns all APP_LOCALES when multilingualEnabled is true", () => {
    expect(computeEnabledLocales({ multilingualEnabled: true })).toEqual(APP_LOCALES);
  });

  it("returns only DEFAULT_LOCALE when multilingualEnabled is false", () => {
    expect(computeEnabledLocales({ multilingualEnabled: false })).toEqual([DEFAULT_LOCALE]);
  });
});

describe("ENABLED_LOCALES / isLocaleEnabled / isMultilingualEnabled (flag ON)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("ENABLED_LOCALES equals APP_LOCALES when flag is true", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "true");
    vi.resetModules();
    const { ENABLED_LOCALES } = await import("./locales");
    expect(ENABLED_LOCALES).toEqual(APP_LOCALES);
  });

  it("isLocaleEnabled returns true for es-US when flag is true", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "true");
    vi.resetModules();
    const { isLocaleEnabled } = await import("./locales");
    expect(isLocaleEnabled("es-US")).toBe(true);
  });

  it("isMultilingualEnabled returns true when flag is true", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "true");
    vi.resetModules();
    const { isMultilingualEnabled } = await import("./locales");
    expect(isMultilingualEnabled()).toBe(true);
  });
});

describe("ENABLED_LOCALES / isLocaleEnabled / isMultilingualEnabled (flag OFF)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("ENABLED_LOCALES contains only en-US when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { ENABLED_LOCALES } = await import("./locales");
    expect(ENABLED_LOCALES).toEqual(["en-US"]);
  });

  it("ENABLED_LOCALES contains only en-US when flag is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "");
    vi.resetModules();
    const { ENABLED_LOCALES } = await import("./locales");
    expect(ENABLED_LOCALES).toEqual(["en-US"]);
  });

  it("isLocaleEnabled returns false for es-US when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { isLocaleEnabled } = await import("./locales");
    expect(isLocaleEnabled("es-US")).toBe(false);
  });

  it("isLocaleEnabled returns true for en-US when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { isLocaleEnabled } = await import("./locales");
    expect(isLocaleEnabled("en-US")).toBe(true);
  });

  it("isMultilingualEnabled returns false when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { isMultilingualEnabled } = await import("./locales");
    expect(isMultilingualEnabled()).toBe(false);
  });
});

describe("hasAppLocale and resolveAppLocale are always backed by APP_LOCALES", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("hasAppLocale('es-US') is true regardless of flag", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { hasAppLocale: guard } = await import("./locales");
    expect(guard("es-US")).toBe(true);
  });

  it("resolveAppLocale({locale:'es-US'}) returns es-US regardless of flag", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { resolveAppLocale: resolve } = await import("./locales");
    expect(resolve({ locale: "es-US" })).toBe("es-US");
  });
});

// Validate the static exports still work for direct imports (flag at test run value).
describe("static export smoke tests", () => {
  it("APP_LOCALES contains en-US and es-US", () => {
    expect(APP_LOCALES).toContain("en-US");
    expect(APP_LOCALES).toContain("es-US");
  });

  it("DEFAULT_LOCALE is en-US", () => {
    expect(DEFAULT_LOCALE).toBe("en-US");
  });

  it("hasAppLocale rejects unknown locales", () => {
    expect(hasAppLocale("fr-FR")).toBe(false);
  });

  it("resolveAppLocale falls back to DEFAULT_LOCALE for unknown input", () => {
    expect(resolveAppLocale({ locale: "fr-FR" })).toBe("en-US");
    expect(resolveAppLocale({ locale: undefined })).toBe("en-US");
  });
});
