import { describe, expect, it } from "vitest";
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
