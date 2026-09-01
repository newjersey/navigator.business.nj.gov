import { describe, expect, it } from "vitest";
import type { PageItem } from "@/domain/content/types";
import { buildCategoryHierarchy, filterFlaggedPages } from "./categories";

const page = (slug: string, category?: string): PageItem => ({
  name: slug,
  slug,
  category,
});

describe("buildCategoryHierarchy", () => {
  it("groups pages by category", () => {
    const page1 = page("create-a-business-plan", "plan");
    const page2 = page("choose-a-business-structure", "plan");
    const page3 = page("register-your-business", "start");

    const result = buildCategoryHierarchy([page1, page2, page3]);

    expect(result.plan.children).toHaveLength(2);
    expect(result.plan.children[0]).toEqual(page1);
    expect(result.plan.children[1]).toEqual(page2);

    expect(result.start.children).toHaveLength(1);
    expect(result.start.children[0]).toEqual(page3);
  });

  it("skips pages with no category", () => {
    const result = buildCategoryHierarchy([
      page("create-a-business-plan", "plan"),
      page("no-category-page", undefined),
    ]);

    expect(result.plan.children).toHaveLength(1);
    expect(Object.keys(result)).toEqual(["plan"]);
  });

  it("throws when a page has no slug", () => {
    expect(() =>
      buildCategoryHierarchy([{ name: "No Slug Page", slug: "", category: "plan" }]),
    ).toThrow();
  });

  it("returns an empty object when given no pages", () => {
    expect(buildCategoryHierarchy([])).toEqual({});
  });

  it("handles multiple categories", () => {
    const result = buildCategoryHierarchy([
      page("create-a-business-plan", "plan"),
      page("register-your-business", "start"),
      page("filings-and-accounting", "operate"),
      page("funding", "grow"),
    ]);

    expect(Object.keys(result)).toEqual(["plan", "start", "operate", "grow"]);
  });
});

describe("filterFlaggedPages", () => {
  it("keeps the housing developer resources page when the flag is enabled", () => {
    const pages = [page("funding", "grow"), page("housing-developer-resources", "grow")];

    const result = filterFlaggedPages(pages, { housingDeveloperResourcesEnabled: true });

    expect(result.map((it) => it.slug)).toEqual(["funding", "housing-developer-resources"]);
  });

  it("removes the housing developer resources page when the flag is disabled", () => {
    const pages = [page("funding", "grow"), page("housing-developer-resources", "grow")];

    const result = filterFlaggedPages(pages, { housingDeveloperResourcesEnabled: false });

    expect(result.map((it) => it.slug)).toEqual(["funding"]);
  });

  it("leaves every other page untouched when the flag is disabled", () => {
    const pages = [
      page("create-a-business-plan", "plan"),
      page("housing-developer-resources", "grow"),
    ];

    const result = filterFlaggedPages(pages, { housingDeveloperResourcesEnabled: false });

    expect(result).toEqual([page("create-a-business-plan", "plan")]);
  });
});
