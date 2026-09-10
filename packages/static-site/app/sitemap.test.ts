import { afterEach, describe, expect, it, vi } from "vitest";
import { loadRecents } from "@/domain/content/loadContent";

describe("sitemap with multilingual disabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("emits only en-US locale in alternates when flag is false", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "false");
    vi.resetModules();
    const sitemapModule = await import("./sitemap");
    const entries = sitemapModule.default();

    for (const entry of entries) {
      const langKeys = Object.keys(entry.alternates?.languages ?? {});
      expect(langKeys).toContain("en-US");
      expect(langKeys).not.toContain("es-US");
    }
  });

  it("emits both en-US and es-US locales in alternates when flag is true", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "true");
    vi.resetModules();
    const sitemapModule = await import("./sitemap");
    const entries = sitemapModule.default();

    for (const entry of entries) {
      const langKeys = Object.keys(entry.alternates?.languages ?? {});
      expect(langKeys).toContain("en-US");
      expect(langKeys).toContain("es-US");
      expect(new URL(entry.url).origin).toBe("https://business.nj.gov");

      for (const alternateUrl of Object.values(entry.alternates?.languages ?? {})) {
        if (alternateUrl === undefined) {
          throw new Error("Expected every sitemap language alternate to have a URL.");
        }

        expect(new URL(alternateUrl).origin).toBe("https://business.nj.gov");
      }
    }
  });

  it("includes every real Update page, sharing collectRoutePathnames with the pagefind indexer", async () => {
    vi.stubEnv("NEXT_PUBLIC_MULTILINGUAL_ENABLED", "true");
    vi.resetModules();
    const sitemapModule = await import("./sitemap");
    const entries = sitemapModule.default();

    const entryUrls = entries.map((entry) => new URL(entry.url).pathname);
    const recents = loadRecents();

    expect(recents.length).toBeGreaterThan(0);
    for (const recent of recents) {
      expect(entryUrls).toContain(`/updates/${recent.slug}`);
    }
  });
});
