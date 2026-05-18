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
      "/learn/plan/create-a-business-plan",
    );

    expect(screen.getByRole("link", { name: "Choose a Business Structure" })).toHaveAttribute(
      "href",
      "/learn/plan/choose-a-business-structure",
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
});
