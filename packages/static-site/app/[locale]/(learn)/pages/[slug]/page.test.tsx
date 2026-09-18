import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HOUSING_DEVELOPER_RESOURCES_SLUG } from "@/domain/content/housingDeveloperResourcesFlag";
import { getApplicationMessages } from "@/domain/i18n/messages";
import ContentPage, { generateMetadata, generateStaticParams } from "./page";

vi.mock("@/domain/categories", () => ({
  CATEGORY_HIERARCHY: {
    plan: {
      children: [
        { slug: "create-a-business-plan", name: "Create a Business Plan" },
        { slug: "choose-a-business-structure", name: "Choose a Business Structure" },
      ],
    },
    start: {
      children: [{ slug: "something-else", name: "Something Else" }],
    },
    grow: {
      children: [{ slug: "housing-developer-resources", name: "Housing Developer Resources" }],
    },
  },
}));

vi.mock("@/domain/content/loadContent", () => ({
  loadPages: () => [
    { slug: "create-a-business-plan", name: "Create a Business Plan", category: "plan" },
    {
      slug: "funding",
      name: "Funding",
      category: "grow",
      "sub-heading-text": "Whether you're looking for startup capital...",
    },
    {
      slug: "housing-developer-resources",
      name: "Housing Developer Resources",
      category: "grow",
      "sub-heading-text": "Explore state funding programs available to housing developers...",
    },
  ],
  loadIndustries: () => [],
  loadFundings: () => [],
  loadSectors: () => [],
}));

describe("generateStaticParams", () => {
  it("returns one entry per slug in CATEGORY_HIERARCHY, skipping slugs with their own route", () => {
    const result = generateStaticParams();
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { slug: "create-a-business-plan" },
      { slug: "choose-a-business-structure" },
      { slug: "something-else" },
    ]);
  });
});

describe("generateMetadata", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("brands the title with the page's own name and its sub-heading as the description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: "create-a-business-plan" }),
    });

    expect(metadata.title).toEqual({ absolute: "Create a Business Plan | Business.NJ.gov" });
    expect(metadata.alternates?.canonical).toBe("/pages/create-a-business-plan");
  });

  it("uses the localized message title for the funding page, not the English-only frontmatter name", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: "funding" }),
    });

    expect(metadata.title).toEqual({ absolute: "Funding | Business.NJ.gov" });
    expect(metadata.description).toBe("Whether you're looking for startup capital...");
  });

  it("falls back to alternates-only metadata for an unknown slug", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: "does-not-exist" }),
    });

    expect(metadata.title).toBeUndefined();
    expect(metadata.alternates?.canonical).toBe("/pages/does-not-exist");
  });
});

describe("ContentPage", () => {
  it("renders the page name as an h1", async () => {
    render(
      await ContentPage({
        params: Promise.resolve({
          locale: "en-US",
          category: "plan",
          slug: "create-a-business-plan",
        }),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Create a Business Plan" }),
    ).toBeInTheDocument();
  });
});

describe("ContentPage — unknown slug", () => {
  it("triggers a 404 for a slug with no matching content page", async () => {
    await expect(
      ContentPage({
        params: Promise.resolve({
          locale: "en-US",
          slug: "something",
        }),
      }),
    ).rejects.toThrow();
  });
});

describe("ContentPage — funding slug", () => {
  it("renders FundingPageContent for the funding slug", async () => {
    const page = await ContentPage({
      params: Promise.resolve({
        locale: "en-US",
        slug: "funding",
      }),
    });
    render(
      <NextIntlClientProvider locale="en-US" messages={getApplicationMessages({ locale: "en-US" })}>
        {page}
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Funding" })).toBeInTheDocument();
  });
});

describe("ContentPage — a slug served by its own route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("404s the housing slug here even with its flag enabled, since it lives at its own route", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "true");

    await expect(
      ContentPage({
        params: Promise.resolve({ locale: "en-US", slug: HOUSING_DEVELOPER_RESOURCES_SLUG }),
      }),
    ).rejects.toThrow();
  });

  it("omits the housing slug from generateStaticParams so it is never prerendered here", () => {
    expect(generateStaticParams()).not.toContainEqual({ slug: HOUSING_DEVELOPER_RESOURCES_SLUG });
  });

  it("returns alternates-only metadata instead of claiming the page title", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: HOUSING_DEVELOPER_RESOURCES_SLUG }),
    });

    expect(metadata.title).toBeUndefined();
    expect(metadata.alternates?.canonical).toBe(`/pages/${HOUSING_DEVELOPER_RESOURCES_SLUG}`);
  });
});
