import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { UpdatesPageMessages } from "@/domain/content/messageTypes";
import type { RecentItem } from "@/domain/content/types";
import UpdateDetail from "./UpdateDetail";

const messages = {
  cardUpdatedLabel: "Last Updated",
  detailCtaFallback: "Learn More",
  categoryLabels: {
    "Grants and Resources": "Grants and Resources",
    "Rules and Regulations": "Rules and Regulations",
  },
} as unknown as UpdatesPageMessages;

const recent = (overrides: Partial<RecentItem> = {}): RecentItem =>
  ({
    name: "NJ Ignite",
    slug: "nj-ignite",
    date: "2022-07-14",
    topics: "Grants and Resources",
    status: "Published",
    body: "NJ Ignite provides rent support for tech startups.",
    ...overrides,
  }) as RecentItem;

describe("UpdateDetail", () => {
  it("renders the update name as an h1", () => {
    render(<UpdateDetail recent={recent()} messages={messages} />);
    expect(screen.getByRole("heading", { level: 1, name: "NJ Ignite" })).toBeInTheDocument();
  });

  it("renders the last-updated date formatted as Month D, YYYY", () => {
    render(<UpdateDetail recent={recent({ date: "2022-07-14" })} messages={messages} />);
    expect(screen.getByText(/Last Updated/)).toBeInTheDocument();
    expect(screen.getByText(/July 14, 2022/)).toBeInTheDocument();
  });

  it("renders the category tag", () => {
    render(
      <UpdateDetail recent={recent({ topics: "Grants and Resources" })} messages={messages} />,
    );
    expect(screen.getByText("Grants and Resources")).toBeInTheDocument();
  });

  it("overrides usa-tag's uppercase transform to keep the category label title case", () => {
    render(
      <UpdateDetail recent={recent({ topics: "Grants and Resources" })} messages={messages} />,
    );
    expect(screen.getByText("Grants and Resources")).toHaveClass("updates-category-tag");
  });

  it("renders the body as markdown", () => {
    render(
      <UpdateDetail recent={recent({ body: "Some **bold** content." })} messages={messages} />,
    );
    expect(screen.getByText("bold")).toBeInTheDocument();
  });

  it("renders a CTA button using cta-text when both cta-text and cta-link are present", () => {
    render(
      <UpdateDetail
        recent={recent({ "cta-text": "Apply Now", "cta-link": "https://example.com/apply" })}
        messages={messages}
      />,
    );
    const link = screen.getByRole("link", { name: "Apply Now" });
    expect(link).toHaveAttribute("href", "https://example.com/apply");
  });

  it("falls back to detailCtaFallback label when cta-link is present without cta-text", () => {
    render(
      <UpdateDetail
        recent={recent({ "cta-link": "https://example.com/apply" })}
        messages={messages}
      />,
    );
    expect(screen.getByRole("link", { name: "Learn More" })).toBeInTheDocument();
  });

  it("does not render a CTA button when cta-link is missing", () => {
    render(<UpdateDetail recent={recent({ "cta-link": undefined })} messages={messages} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
