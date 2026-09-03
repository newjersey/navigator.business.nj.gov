import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  it("returns one entry per slug in CATEGORY_HIERARCHY", () => {
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

  it("uses the localized message title for the housing developer resources page, not the English-only frontmatter name", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "true");

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: "housing-developer-resources" }),
    });

    expect(metadata.title).toEqual({ absolute: "Housing Developer Resources | Business.NJ.gov" });
    expect(metadata.description).toBe(
      "Explore state funding programs available to housing developers...",
    );
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

describe("ContentPage — housing-developer-resources slug", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders FundingPageContent with the housing developer resources title", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "true");

    const page = await ContentPage({
      params: Promise.resolve({
        locale: "en-US",
        slug: "housing-developer-resources",
      }),
    });
    render(
      <NextIntlClientProvider locale="en-US" messages={getApplicationMessages({ locale: "en-US" })}>
        {page}
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Housing Developer Resources" }),
    ).toBeInTheDocument();
  });
});

describe("ContentPage — housing-developer-resources slug, flag disabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("404s the direct route even though the slug exists in content", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "false");

    await expect(
      ContentPage({
        params: Promise.resolve({ locale: "en-US", slug: "housing-developer-resources" }),
      }),
    ).rejects.toThrow();
  });

  it("falls back to alternates-only metadata instead of the real page title", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "false");

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: "housing-developer-resources" }),
    });

    expect(metadata.title).toBeUndefined();
    expect(metadata.alternates?.canonical).toBe("/pages/housing-developer-resources");
  });
});
