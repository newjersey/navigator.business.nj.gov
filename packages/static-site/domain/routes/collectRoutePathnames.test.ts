import { describe, expect, it } from "vitest";
import { loadRecents } from "@/domain/content/loadContent";
import { collectRoutePathnames } from "./collectRoutePathnames";

describe("collectRoutePathnames", () => {
  it("includes the static one-off routes", () => {
    const pathnames = collectRoutePathnames();

    expect(pathnames).toContain("/");
    expect(pathnames).toContain("/learn");
    expect(pathnames).toContain("/our-software-and-reuse");
    expect(pathnames).toContain("/privacy-policy");
  });

  it("includes every real published update's pathname", () => {
    const pathnames = collectRoutePathnames();
    const recents = loadRecents();

    expect(recents.length).toBeGreaterThan(0);
    for (const recent of recents) {
      expect(pathnames).toContain(`/updates/${recent.slug}`);
    }
  });

  it("only emits update pathnames prefixed with /updates/", () => {
    const pathnames = collectRoutePathnames();
    const updatePathnames = pathnames.filter((pathname) => pathname.startsWith("/updates/"));
    const recents = loadRecents();

    expect(updatePathnames).toHaveLength(recents.length);
  });

  it("emits only unique pathnames", () => {
    const pathnames = collectRoutePathnames();

    expect(new Set(pathnames).size).toBe(pathnames.length);
  });
});
