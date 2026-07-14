import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import ContentPage, { generateStaticParams } from "./page";

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
