import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CategoryPage, { generateStaticParams } from "./page";

vi.mock("@/domain/categories", () => ({
  CATEGORY_HIERARCHY: {
    plan: {
      children: [
        {
          slug: "create-a-business-plan",
          name: "Create a Business Plan",
          "sub-heading-text": "Business Plan Subheader",
        },
        { slug: "choose-a-business-structure", name: "Choose a Business Structure" },
        { slug: "hidden-content", name: "Don't display me", hideFromCategoryPage: "true" },
      ],
    },
    start: { children: [] },
  },
}));

describe("generateStaticParams", () => {
  it("returns each category from CATEGORY_HIERARCHY", () => {
    const result = generateStaticParams();
    expect(result).toEqual([{ category: "plan" }, { category: "start" }]);
  });
});

describe("CategoryPage", () => {
  it("renders a link for each slug in the category", async () => {
    render(
      await CategoryPage({
        params: Promise.resolve({ locale: "en-US", category: "plan" }),
      }),
    );

    expect(screen.getByRole("link", { name: "Create a Business Plan" })).toHaveAttribute(
      "href",
      "/pages/create-a-business-plan",
    );

    expect(screen.getByRole("link", { name: "Choose a Business Structure" })).toHaveAttribute(
      "href",
      "/pages/choose-a-business-structure",
    );
  });

  it("renders the sub-heading-text when it exists", async () => {
    render(
      await CategoryPage({
        params: Promise.resolve({ locale: "en-US", category: "plan" }),
      }),
    );

    expect(screen.getByText("Business Plan Subheader")).toBeInTheDocument();
  });

  it("does not render a link when a page has hideFromCategoryPage=true", async () => {
    render(
      await CategoryPage({
        params: Promise.resolve({ locale: "en-US", category: "plan" }),
      }),
    );

    expect(screen.queryByText("Don't display me")).not.toBeInTheDocument();
  });

  it("returns notFound for an unknown category", async () => {
    await expect(
      CategoryPage({ params: Promise.resolve({ locale: "en-US", category: "updates" }) }),
    ).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });
});
