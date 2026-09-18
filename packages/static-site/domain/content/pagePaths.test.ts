import { describe, expect, it } from "vitest";
import {
  HOUSING_DEVELOPER_RESOURCES_PATHNAME,
  HOUSING_DEVELOPER_RESOURCES_SLUG,
} from "@/domain/content/housingDeveloperResourcesFlag";
import { hasDedicatedRoute, resolvePagePathname } from "@/domain/content/pagePaths";

describe("resolvePagePathname", () => {
  it("resolves the housing developer resources slug to its dedicated route", () => {
    expect(resolvePagePathname(HOUSING_DEVELOPER_RESOURCES_SLUG)).toBe(
      HOUSING_DEVELOPER_RESOURCES_PATHNAME,
    );
  });

  it("resolves an ordinary slug under /pages", () => {
    expect(resolvePagePathname("funding")).toBe("/pages/funding");
  });

  it("does not treat an inherited object property as a dedicated route", () => {
    expect(resolvePagePathname("constructor")).toBe("/pages/constructor");
  });
});

describe("hasDedicatedRoute", () => {
  it("is true for the housing developer resources slug", () => {
    expect(hasDedicatedRoute(HOUSING_DEVELOPER_RESOURCES_SLUG)).toBe(true);
  });

  it("is false for an ordinary slug", () => {
    expect(hasDedicatedRoute("funding")).toBe(false);
  });

  it("is false for an inherited object property", () => {
    expect(hasDedicatedRoute("constructor")).toBe(false);
  });
});
