import { describe, expect, it } from "vitest";
import type { PageItem } from "@/domain/content/types";
import {
  buildContentsEntries,
  buildSectionId,
  parsePlasticBanSections,
} from "./parsePlasticBanSections";

const page = (overrides: Partial<PageItem> = {}): PageItem => ({
  name: "Test Page",
  slug: "test-page",
  ...overrides,
});

describe("buildSectionId", () => {
  it("formats the anchor id from the frontmatter index", () => {
    expect(buildSectionId(3)).toBe("page-section-3");
  });
});

describe("parsePlasticBanSections", () => {
  it("skips index gaps and preserves ascending order", () => {
    const sections = parsePlasticBanSections(
      page({
        "heading-2": "Second",
        "heading-4": "Fourth",
        "heading-7": "Seventh",
      }),
    );

    expect(sections.map((section) => section.index)).toEqual([2, 4, 7]);
    expect(sections.map((section) => section.heading)).toEqual(["Second", "Fourth", "Seventh"]);
  });

  it("maps 'open' and 'closed' collapsible-N values", () => {
    const sections = parsePlasticBanSections(
      page({
        "heading-1": "One",
        "collapsible-1": "open",
        "heading-2": "Two",
        "collapsible-2": "closed",
      }),
    );

    expect(sections[0].collapse).toBe("open");
    expect(sections[1].collapse).toBe("closed");
  });

  it("degrades unrecognized collapsible-N values to plain (undefined)", () => {
    const sections = parsePlasticBanSections(
      page({
        "heading-1": "One",
        "collapsible-1": "true",
        "heading-2": "Two",
        "collapsible-2": "",
      }),
    );

    expect(sections[0].collapse).toBeUndefined();
    expect(sections[1].collapse).toBeUndefined();
  });

  it("leaves collapse undefined when collapsible-N is absent", () => {
    const sections = parsePlasticBanSections(page({ "heading-1": "One" }));
    expect(sections[0].collapse).toBeUndefined();
  });

  it("sets the anchor id from buildSectionId", () => {
    const sections = parsePlasticBanSections(page({ "heading-5": "Five" }));
    expect(sections[0].id).toBe(buildSectionId(5));
  });

  it("drops a section with link-text-N but no link-url-N, matching PageContent", () => {
    const sections = parsePlasticBanSections(page({ "link-text-1": "Click here" }));
    expect(sections).toHaveLength(0);
  });

  it("includes a section defined only by a complete link pair", () => {
    const sections = parsePlasticBanSections(
      page({ "link-text-3": "Sign Up", "link-url-3": "https://example.com" }),
    );
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      index: 3,
      linkText: "Sign Up",
      linkUrl: "https://example.com",
    });
  });

  it("carries the contents-label-N field onto the section", () => {
    const sections = parsePlasticBanSections(
      page({ "heading-1": "About", "contents-label-1": "About the Law" }),
    );
    expect(sections[0].contentsLabel).toBe("About the Law");
  });
});

describe("buildContentsEntries", () => {
  it("returns only sections with a contents label, in order, with '#page-section-N' hrefs", () => {
    const sections = parsePlasticBanSections(
      page({
        "heading-1": "About",
        "contents-label-1": "About the Law",
        "heading-2": "No label here",
        "heading-7": "Vendors",
        "contents-label-7": "Find Vendors and Alternatives",
      }),
    );

    expect(buildContentsEntries(sections)).toEqual([
      { label: "About the Law", href: "#page-section-1" },
      { label: "Find Vendors and Alternatives", href: "#page-section-7" },
    ]);
  });

  it("returns an empty array when no section carries a contents label", () => {
    const sections = parsePlasticBanSections(page({ "heading-1": "About" }));
    expect(buildContentsEntries(sections)).toEqual([]);
  });
});
