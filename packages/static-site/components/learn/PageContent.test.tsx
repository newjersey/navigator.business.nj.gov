/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: <explanation> */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PageItem } from "@/domain/content/types";
import PageContent from "./PageContent";

const page = (overrides: Partial<PageItem> = {}): PageItem => ({
  name: "Test Page",
  slug: "test-page",
  ...overrides,
});

describe("PageContent", () => {
  it("renders the page name as h1", () => {
    render(<PageContent page={page()} />);
    expect(screen.getByRole("heading", { level: 1, name: "Test Page" })).toBeInTheDocument();
  });

  it("renders sub-heading-text as usa-intro", () => {
    render(<PageContent page={page({ "sub-heading-text": "An intro paragraph" })} />);
    const intro = screen.getByText("An intro paragraph");
    expect(intro).toHaveClass("usa-intro");
  });

  it("renders section heading as h2", () => {
    render(<PageContent page={page({ "heading-1": "Section One" })} />);
    expect(screen.getByRole("heading", { level: 2, name: "Section One" })).toBeInTheDocument();
  });

  it("renders section body text", () => {
    render(<PageContent page={page({ "main-text-1": "Some body content" })} />);
    expect(screen.getByText("Some body content")).toBeInTheDocument();
  });

  it("renders tip as info alert", () => {
    render(<PageContent page={page({ "tip-1": "A helpful tip" })} />);
    const alert = screen.getByText("A helpful tip").closest(".usa-alert");
    expect(alert).toHaveClass("usa-alert--info");
  });

  it("renders a link button when both link-text and link-url are present", () => {
    render(
      <PageContent page={page({ "link-text-1": "Click here", "link-url-1": "/some/path" })} />,
    );
    const link = screen.getByRole("link", { name: /Click here/ });
    expect(link).toHaveClass("usa-button");
    expect(link).toHaveAttribute("href", "/some/path");
  });

  it("does not render a link when link-url is missing", () => {
    render(<PageContent page={page({ "link-text-1": "Click here" })} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows external icon for http links", () => {
    render(
      <PageContent
        page={page({ "link-text-1": "External", "link-url-1": "https://example.com" })}
      />,
    );
    const use = document.querySelector("use");
    expect(use?.getAttribute("href")).toContain("#launch");
  });

  it("does not show external icon for internal links", () => {
    render(<PageContent page={page({ "link-text-1": "Internal", "link-url-1": "/some/path" })} />);
    expect(document.querySelector("use")).not.toBeInTheDocument();
  });

  it("renders multiple sections with hr dividers", () => {
    render(
      <PageContent
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
});
