import { describe, expect, it } from "vitest";
import {
  HOUSING_DEVELOPER_RESOURCES_PATHNAME,
  HOUSING_DEVELOPER_RESOURCES_SLUG,
} from "@/domain/content/pagePaths";
import {
  buildPageAccessHelpers,
  disabledPagePathnames,
  disabledPageSlugs,
  isPageDisabled,
  type PageAccessFlag,
} from "./pageAccessFlags";

const enabled: PageAccessFlag = {
  slug: "enabled-page",
  pathname: "/enabled-path",
  isEnabled: () => true,
};

const disabled: PageAccessFlag = {
  slug: "disabled-page",
  pathname: "/disabled-path",
  isEnabled: () => false,
};

describe("buildPageAccessHelpers — disabledPageSlugs", () => {
  it("returns the slug of each disabled page", () => {
    const { disabledPageSlugs } = buildPageAccessHelpers([enabled, disabled]);
    expect(disabledPageSlugs()).toEqual(["disabled-page"]);
  });

  it("excludes slugs of enabled pages", () => {
    const { disabledPageSlugs } = buildPageAccessHelpers([enabled, disabled]);
    expect(disabledPageSlugs()).not.toContain("enabled-page");
  });

  it("returns an empty array when all pages are enabled", () => {
    const { disabledPageSlugs } = buildPageAccessHelpers([enabled]);
    expect(disabledPageSlugs()).toEqual([]);
  });

  it("returns all slugs when all pages are disabled", () => {
    const second: PageAccessFlag = {
      slug: "also-disabled",
      pathname: "/also-disabled",
      isEnabled: () => false,
    };
    const { disabledPageSlugs } = buildPageAccessHelpers([disabled, second]);
    expect(disabledPageSlugs()).toEqual(["disabled-page", "also-disabled"]);
  });
});

describe("buildPageAccessHelpers — disabledPagePathnames", () => {
  it("returns the pathname of each disabled page", () => {
    const { disabledPagePathnames } = buildPageAccessHelpers([enabled, disabled]);
    expect(disabledPagePathnames()).toEqual(["/disabled-path"]);
  });

  it("excludes pathnames of enabled pages", () => {
    const { disabledPagePathnames } = buildPageAccessHelpers([enabled, disabled]);
    expect(disabledPagePathnames()).not.toContain("/enabled-path");
  });

  it("returns an empty array when all pages are enabled", () => {
    const { disabledPagePathnames } = buildPageAccessHelpers([enabled]);
    expect(disabledPagePathnames()).toEqual([]);
  });
});

describe("buildPageAccessHelpers — isPageDisabled", () => {
  it("returns true for a slug whose flag is off", () => {
    const { isPageDisabled } = buildPageAccessHelpers([enabled, disabled]);
    expect(isPageDisabled("disabled-page")).toBe(true);
  });

  it("returns false for a slug whose flag is on", () => {
    const { isPageDisabled } = buildPageAccessHelpers([enabled, disabled]);
    expect(isPageDisabled("enabled-page")).toBe(false);
  });

  it("returns false for a slug not in the registry", () => {
    const { isPageDisabled } = buildPageAccessHelpers([enabled, disabled]);
    expect(isPageDisabled("unknown-page")).toBe(false);
  });
});

describe("module-level exports — current registry has no entries", () => {
  it("no pages are currently disabled", () => {
    expect(disabledPageSlugs()).toEqual([]);
    expect(disabledPagePathnames()).toEqual([]);
  });

  it("housing-developer-resources is unconditionally accessible", () => {
    expect(isPageDisabled(HOUSING_DEVELOPER_RESOURCES_SLUG)).toBe(false);
    expect(disabledPagePathnames()).not.toContain(HOUSING_DEVELOPER_RESOURCES_PATHNAME);
  });
});
