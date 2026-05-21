import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  loadPageBySlug: (slug: string) => ({
    slug,
    name: "Create a Business Plan",
    category: "plan",
  }),
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
