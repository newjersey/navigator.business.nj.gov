import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import type { UpdatesPageMessages } from "@/domain/content/messageTypes";
import type { RecentItem } from "@/domain/content/types";
import UpdatesCard from "./UpdatesCard";

const cardMessages = {
  cardUpdatedLabel: "Last Updated",
  cardReadMore: "Read more",
  categoryLabels: {
    "Grants and Resources": "Grants and Resources",
    "Rules and Regulations": "Rules and Regulations",
  },
} as unknown as UpdatesPageMessages;

const renderCard = (props: Omit<ComponentProps<typeof UpdatesCard>, "messages">) =>
  render(<UpdatesCard messages={cardMessages} {...props} />);

const recent = (overrides: Partial<RecentItem> = {}): RecentItem =>
  ({
    name: "NJ Ignite",
    slug: "nj-ignite",
    date: "2022-07-14",
    topics: "Grants and Resources",
    status: "Published",
    body: "NJ Ignite provides rent support for tech startups that are moving to an approved collaborative workspace.",
    ...overrides,
  }) as RecentItem;

describe("UpdatesCard", () => {
  it("renders the update name as a heading", () => {
    renderCard({ recent: recent() });
    expect(screen.getByRole("heading", { name: "NJ Ignite" })).toBeInTheDocument();
  });

  it("links the heading to the update's detail page", () => {
    renderCard({ recent: recent({ slug: "nj-ignite" }) });
    const link = screen.getByRole("link", { name: "NJ Ignite" });
    expect(link).toHaveAttribute("href", "/updates/nj-ignite");
  });

  it("renders the last-updated date formatted as Month D, YYYY", () => {
    renderCard({ recent: recent({ date: "2022-07-14" }) });
    expect(screen.getByText(/Last Updated/)).toBeInTheDocument();
    expect(screen.getByText(/July 14, 2022/)).toBeInTheDocument();
  });

  it("does not render a last-updated line when date is missing", () => {
    renderCard({ recent: recent({ date: undefined }) });
    expect(screen.queryByText(/Last Updated/)).not.toBeInTheDocument();
  });

  it("renders the category tag", () => {
    renderCard({ recent: recent({ topics: "Grants and Resources" }) });
    expect(screen.getByText("Grants and Resources")).toBeInTheDocument();
  });

  it("overrides usa-tag's uppercase transform to keep the category label title case", () => {
    renderCard({ recent: recent({ topics: "Grants and Resources" }) });
    expect(screen.getByText("Grants and Resources")).toHaveClass("updates-category-tag");
  });

  it("does not render a category tag when topics is missing", () => {
    const { container } = renderCard({ recent: recent({ topics: undefined }) });
    expect(container.querySelector(".usa-tag")).toBeNull();
  });

  it("renders a Read more link to the detail page", () => {
    renderCard({ recent: recent({ slug: "nj-ignite" }) });
    const readMore = screen.getByRole("link", { name: "Read more" });
    expect(readMore).toHaveAttribute("href", "/updates/nj-ignite");
  });

  it("renders the summary as the excerpt when present", () => {
    renderCard({ recent: recent({ summary: "A short summary.", body: "Full body content." }) });
    expect(screen.getByText("A short summary.")).toBeInTheDocument();
    expect(screen.queryByText("Full body content.")).not.toBeInTheDocument();
  });

  it("falls back to the body as the excerpt when summary is missing", () => {
    renderCard({ recent: recent({ summary: undefined, body: "Full body content." }) });
    expect(screen.getByText(/Full body content\./)).toBeInTheDocument();
  });

  it("highlights a query match in the name", () => {
    renderCard({ recent: recent({ name: "Grant Program" }), query: "grant" });
    const heading = screen.getByRole("heading", { name: "Grant Program" });
    const mark = heading.querySelector("mark.funding-search-highlight");
    expect(mark).not.toBeNull();
    expect(mark).toHaveTextContent("Grant");
  });

  it("renders no highlight marks when no query is given", () => {
    const { container } = renderCard({ recent: recent() });
    expect(container.querySelector("mark.funding-search-highlight")).toBeNull();
  });
});
