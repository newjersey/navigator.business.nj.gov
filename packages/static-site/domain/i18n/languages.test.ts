import { afterEach, describe, expect, it, vi } from "vitest";
import { LANGUAGE_DESCRIPTORS, textDirectionForLocale } from "./languages";
import type { AppLocale } from "./locales";

describe("languages", () => {
  describe("LANGUAGE_DESCRIPTORS ordering", () => {
    it("is ordered alphabetically by native name", () => {
      const nativeNames = LANGUAGE_DESCRIPTORS.map((descriptor) => descriptor.nativeName);
      const sorted = [...nativeNames].sort((a, b) => a.localeCompare(b));

      expect(nativeNames).toEqual(sorted);
    });
  });

  describe("textDirectionForLocale", () => {
    // Skipped while only LTR locales (en/es) ship. Restore by adding an RTL
    // language back to APP_LOCALES + LANGUAGE_DESCRIPTORS; the RTL plumbing it
    // exercises is still in place.
    it.skip("returns rtl for Arabic", () => {
      expect(textDirectionForLocale("ar-US" as AppLocale)).toBe("rtl");
    });

    it("returns ltr for English", () => {
      expect(textDirectionForLocale("en-US")).toBe("ltr");
    });

    it("returns the declared direction for every descriptor", () => {
      for (const descriptor of LANGUAGE_DESCRIPTORS) {
        expect(textDirectionForLocale(descriptor.locale)).toBe(descriptor.textDirection);
      }
    });
  });
});

describe("LANGUAGE_DESCRIPTORS with multilingual disabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("contains only the English descriptor when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const { LANGUAGE_DESCRIPTORS: descriptors } = await import("./languages");
    expect(descriptors).toHaveLength(1);
    expect(descriptors[0].locale).toBe("en-US");
  });

  it("contains both descriptors when flag is true", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "true");
    vi.resetModules();
    const { LANGUAGE_DESCRIPTORS: descriptors } = await import("./languages");
    expect(descriptors).toHaveLength(2);
  });
});
