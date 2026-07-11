import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WhatsNewContent } from "@/domain/content/messageTypes";
import type { RecentItem } from "@/domain/content/types";
import { WhatsNewSection } from "./WhatsNewSection";

const content: WhatsNewContent = {
  title: "What's New",
  viewAllLink: {
    label: "View All Updates",
    href: "/updates",
    isInternal: true,
    opensInNewTab: false,
  },
};

const makeRecent = (overrides: Partial<RecentItem> = {}): RecentItem =>
  ({
    name: "NJ Ignite",
    slug: "nj-ignite",
    date: "2022-07-14",
    topics: "Grants and Resources",
    body: "",
    ...overrides,
  }) as RecentItem;

describe("WhatsNewSection", () => {
  it("renders nothing when there are no recents", () => {
    const { container } = render(<WhatsNewSection content={content} recents={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links each card to the update's /updates/[slug] detail page", () => {
    render(<WhatsNewSection content={content} recents={[makeRecent({ slug: "nj-ignite" })]} />);
    const link = screen.getByRole("link", { name: /NJ Ignite/ });
    expect(link).toHaveAttribute("href", "/updates/nj-ignite");
  });

  it("renders the View All Updates link pointing at /updates", () => {
    render(<WhatsNewSection content={content} recents={[makeRecent()]} />);
    const link = screen.getByRole("link", { name: "View All Updates" });
    expect(link).toHaveAttribute("href", "/updates");
  });
});
