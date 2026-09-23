/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: test suite */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { INTERCOM_LAUNCHER_HREF } from "@/components/learn/pageMarkdown";
import type { PageItem } from "@/domain/content/types";
import { getApplicationMessages } from "@/domain/i18n/messages";
import PageContent from "./PageContent";

const page = (overrides: Partial<PageItem> = {}): PageItem => ({
  name: "Test Page",
  slug: "test-page",
  ...overrides,
});

const appMessages = getApplicationMessages({ locale: "en-US" });

describe("PageContent", () => {
  it("renders the page name as h1", () => {
    render(<PageContent locale="en-US" page={page()} />);
    expect(screen.getByRole("heading", { level: 1, name: "Test Page" })).toBeInTheDocument();
  });

  it("renders sub-heading-text as usa-intro", () => {
    render(
      <PageContent locale="en-US" page={page({ "sub-heading-text": "An intro paragraph" })} />,
    );
    const intro = screen.getByText("An intro paragraph");
    expect(intro).toHaveClass("usa-intro");
  });

  it("renders section heading as h2", () => {
    render(<PageContent locale="en-US" page={page({ "heading-1": "Section One" })} />);
    expect(screen.getByRole("heading", { level: 2, name: "Section One" })).toBeInTheDocument();
  });

  it("renders section body text", () => {
    render(<PageContent locale="en-US" page={page({ "main-text-1": "Some body content" })} />);
    expect(screen.getByText("Some body content")).toBeInTheDocument();
  });

  it("renders tip as info alert", () => {
    render(<PageContent locale="en-US" page={page({ "tip-1": "A helpful tip" })} />);
    const alert = screen.getByText("A helpful tip").closest(".usa-alert");
    expect(alert).toHaveClass("usa-alert--info");
  });

  it("renders a link button when both link-text and link-url are present", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({ "link-text-1": "Click here", "link-url-1": "/some/path" })}
      />,
    );
    const link = screen.getByRole("link", { name: /Click here/ });
    expect(link).toHaveClass("usa-button");
    expect(link).toHaveAttribute("href", "/some/path");
  });

  it("does not render a link when link-url is missing", () => {
    render(<PageContent locale="en-US" page={page({ "link-text-1": "Click here" })} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows external icon for http links", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({ "link-text-1": "External", "link-url-1": "https://example.com" })}
      />,
    );
    const use = document.querySelector("use");
    expect(use?.getAttribute("href")).toContain("#launch");
  });

  it("does not show external icon for internal links", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({ "link-text-1": "Internal", "link-url-1": "/some/path" })}
      />,
    );
    expect(document.querySelector("use")).not.toBeInTheDocument();
  });

  it("renders multiple sections with hr dividers", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({
          "heading-1": "Section One",
          "heading-2": "Section Two",
          "heading-3": "Section Three",
        })}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    expect(document.querySelectorAll("hr")).toHaveLength(3);
  });

  it("renders multiple sections if page content does not follow standard numeric ordering", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({
          "heading-2": "Section One",
          "heading-4": "Section Two",
          "heading-7": "Section Three",
        })}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    expect(document.querySelectorAll("hr")).toHaveLength(3);
  });

  it("renders up to 11 page sections", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({
          "heading-1": "Section One",
          "heading-2": "Section Two",
          "heading-3": "Section Three",
          "heading-4": "Section Four",
          "heading-5": "Section Five",
          "heading-6": "Section Six",
          "heading-7": "Section Seven",
          "heading-8": "Section Eight",
          "heading-9": "Section Nine",
          "heading-10": "Section Ten",
          "heading-11": "Section Eleven",
          "heading-12": "Section Twelve",
        })}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(11);
    expect(document.querySelectorAll("hr")).toHaveLength(11);
  });

  it("renders the Intercom sentinel link as a launcher button, not a link", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({ "main-text-1": `Question? [Chat with us](${INTERCOM_LAUNCHER_HREF}).` })}
      />,
    );
    const button = screen.getByRole("button", { name: "Chat with us" });
    expect(button).toHaveClass("text-link-button");
    expect(button).toHaveClass("intercomlaunch");
    expect(button).toHaveAttribute("type", "button");
    expect(screen.queryByRole("link", { name: "Chat with us" })).not.toBeInTheDocument();
  });

  it("renders a non-sentinel fragment link as a plain anchor", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({ "main-text-1": "See [Set-asides](#Small-Business-Set-Aside-Programs)." })}
      />,
    );
    const link = screen.getByRole("link", { name: "Set-asides" });
    expect(link).toHaveAttribute("href", "#Small-Business-Set-Aside-Programs");
    expect(screen.queryByRole("button", { name: "Set-asides" })).not.toBeInTheDocument();
  });

  it("renders an ordinary external link as a plain anchor", () => {
    render(
      <PageContent locale="en-US" page={page({ "main-text-1": "Visit [NJ](https://nj.gov)." })} />,
    );
    const link = screen.getByRole("link", { name: "NJ" });
    expect(link).toHaveAttribute("href", "https://nj.gov");
  });

  it("renders a YouTube embed link as an inline player, not a link", () => {
    const { container } = render(
      <PageContent
        locale="en-US"
        page={page({
          "main-text-1": "Watch it: [Overview video](https://www.youtube.com/embed/B96oKulIId4)",
        })}
      />,
    );
    const iframe = container.querySelector("iframe.video-embed");
    expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/B96oKulIId4");
    expect(iframe).toHaveAttribute("title", "Overview video");
    expect(iframe).toHaveAttribute("loading", "lazy");
    expect(screen.queryByRole("link", { name: "Overview video" })).not.toBeInTheDocument();
  });

  it("renders a YouTube watch link as a plain anchor, not an embedded player", () => {
    const { container } = render(
      <PageContent
        locale="en-US"
        page={page({
          "main-text-1": "Watch it: [Overview video](https://www.youtube.com/watch?v=B96oKulIId4)",
        })}
      />,
    );
    const link = screen.getByRole("link", { name: "Overview video" });
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=B96oKulIId4");
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("renders plain sections with no collapsible-N value as always-visible headings", () => {
    render(<PageContent locale="en-US" page={page({ "heading-1": "Plain Section" })} />);
    expect(screen.getByRole("heading", { level: 2, name: "Plain Section" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Plain Section" })).not.toBeInTheDocument();
  });

  it("renders a collapsible-N section as an accordion button with the authored initial state", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({ "heading-1": "Open Section", "collapsible-1": "open" })}
      />,
    );
    const button = screen.getByRole("button", { name: "Open Section" });
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button.closest(".usa-accordion__heading")).not.toBeNull();
  });

  it("renders a collapsible-N: closed section collapsed", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({ "heading-1": "Closed Section", "collapsible-1": "closed" })}
      />,
    );
    const button = screen.getByRole("button", { name: "Closed Section" });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("degrades an unrecognized collapsible-N value to a plain section", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({ "heading-1": "Untrusted", "collapsible-1": "true" })}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Untrusted" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Untrusted" })).not.toBeInTheDocument();
  });

  it("renders no Contents nav when no section authors a contents-label-N", () => {
    render(<PageContent locale="en-US" page={page({ "heading-1": "Section One" })} />);
    expect(
      screen.queryByRole("navigation", { name: appMessages.learn.pageContentsHeading }),
    ).not.toBeInTheDocument();
  });

  it("renders a Contents nav with one link per contents-label-N, in order", () => {
    render(
      <PageContent
        locale="en-US"
        page={page({
          "heading-1": "First",
          "contents-label-1": "About",
          "heading-2": "Second",
          "contents-label-2": "Details",
        })}
      />,
    );
    const nav = screen.getByRole("navigation", { name: appMessages.learn.pageContentsHeading });
    const links = Array.from(nav.querySelectorAll("a"));

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAccessibleName("About");
    expect(links[0]).toHaveAttribute("href", "#page-section-1");
    expect(links[1]).toHaveAccessibleName("Details");
    expect(links[1]).toHaveAttribute("href", "#page-section-2");
  });

  it("never points a Contents link at a missing section (dangling-anchor guard)", () => {
    const { container } = render(
      <PageContent
        locale="en-US"
        page={page({ "heading-1": "First", "contents-label-1": "About" })}
      />,
    );
    const nav = screen.getByRole("navigation", { name: appMessages.learn.pageContentsHeading });
    const href = nav.querySelector("a")?.getAttribute("href") as string;
    expect(container.querySelector(href)).not.toBeNull();
  });

  it("drops a section defined only by link-text-N without a matching link-url-N", () => {
    const { container } = render(
      <PageContent locale="en-US" page={page({ "link-text-1": "Click here" })} />,
    );
    expect(container.querySelectorAll("section, hr")).toHaveLength(0);
  });
});
