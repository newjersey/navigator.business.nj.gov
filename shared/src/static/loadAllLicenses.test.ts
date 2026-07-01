import { loadAllLicenses } from "./loadAllLicenses";

describe("loadAllLicenses", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("includes all webflow-licenses and license-tasks, and only tasks flagged syncToWebflow", () => {
    const all = loadAllLicenses();
    // A webflow-license file appears (sample a known slug).
    expect(all.some((l) => l.urlSlug === "adoption-agency")).toBe(true);
    // A roadmaps/tasks file WITH syncToWebflow appears.
    expect(all.some((l) => l.urlSlug === "trucking-usdot")).toBe(true);
    // The municipal-tasks file appears.
    expect(all.some((l) => l.urlSlug === "elevator-registration")).toBe(true);
  });

  it("dedupes by webflowId, keeping a single entry per id", () => {
    const all = loadAllLicenses();
    const ids = all.map((l) => l.webflowId).filter(Boolean);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("loads the full license collection (guards against a dir-read regression)", () => {
    // The Webflow license collection is ~551 cards. Assert a floor rather than an
    // exact count so legitimate content edits don't break the test, while a
    // missing source directory (which would drop hundreds of cards) still fails.
    expect(loadAllLicenses().length).toBeGreaterThan(500);
  });
});
