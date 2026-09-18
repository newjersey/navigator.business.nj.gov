/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: test suite */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlasticBanPage } from "@/components/learn/PlasticBanPage";
import { loadPageBySlug } from "@/domain/content/loadContent";
import { MAX_PAGE_SECTION_INDEX, type PageItem } from "@/domain/content/types";
import { getApplicationMessages } from "@/domain/i18n/messages";

const page = loadPageBySlug("plastic-ban-law");
const appMessages = getApplicationMessages({ locale: "en-US" });

/** Builds a minimal synthetic page for exercising frontmatter-parsing edge cases not present on the real content page. */
const syntheticPage = (overrides: Partial<PageItem>): PageItem => ({
  name: "Test Page",
  slug: "test-page",
  ...overrides,
});

/** Every `heading-N`/`collapsible-N` index authored on the real content page. */
const sectionIndices = Array.from({ length: MAX_PAGE_SECTION_INDEX }, (_, i) => i + 1).filter(
  (index) => page[`heading-${index}`],
);

describe("PlasticBanPage", () => {
  it("renders the page name as h1 and the sub-heading as usa-intro", () => {
    render(<PlasticBanPage locale="en-US" page={page} />);

    expect(screen.getByRole("heading", { level: 1, name: page.name })).toBeInTheDocument();

    const intro = screen.getByText(page["sub-heading-text"] as string);
    expect(intro).toHaveClass("usa-intro");
  });

  it("renders a Contents nav with one link per contents-label-N, in order", () => {
    render(<PlasticBanPage locale="en-US" page={page} />);

    const nav = screen.getByRole("navigation", { name: appMessages.learn.pageContentsHeading });
    const labelledIndices = sectionIndices.filter((index) => page[`contents-label-${index}`]);
    const links = screen.getAllByRole("link", { name: /.+/ }).filter((link) => nav.contains(link));

    expect(links).toHaveLength(labelledIndices.length);
    links.forEach((link, position) => {
      const index = labelledIndices[position];
      expect(link).toHaveAccessibleName(page[`contents-label-${index}`] as string);
      expect(link).toHaveAttribute("href", `#page-section-${index}`);
    });
  });

  it("never points a Contents link at a missing section (dangling-anchor guard)", () => {
    const { container } = render(<PlasticBanPage locale="en-US" page={page} />);

    const nav = screen.getByRole("navigation", { name: appMessages.learn.pageContentsHeading });
    const hrefs = Array.from(nav.querySelectorAll("a")).map(
      (a) => a.getAttribute("href") as string,
    );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(container.querySelector(href)).not.toBeNull();
    }
  });

  it("renders sections with no collapsible-N value as plain, always-visible headings", () => {
    render(<PlasticBanPage locale="en-US" page={page} />);

    const plainIndices = sectionIndices.filter((index) => !page[`collapsible-${index}`]);
    expect(plainIndices.length).toBeGreaterThan(0);

    for (const index of plainIndices) {
      const heading = page[`heading-${index}`] as string;
      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: heading })).not.toBeInTheDocument();
    }
  });

  it("renders collapsible-N sections as accordion buttons with the authored initial state", () => {
    render(<PlasticBanPage locale="en-US" page={page} />);

    const collapsibleIndices = sectionIndices.filter((index) => page[`collapsible-${index}`]);
    expect(collapsibleIndices.length).toBeGreaterThan(0);

    for (const index of collapsibleIndices) {
      const heading = page[`heading-${index}`] as string;
      const button = screen.getByRole("button", { name: heading });
      const expectedExpanded = page[`collapsible-${index}`] === "open";
      expect(button).toHaveAttribute("aria-expanded", String(expectedExpanded));
      expect(button.closest(".usa-accordion__heading")).not.toBeNull();
    }
  });

  it("renders an hr divider after every section, including collapsible ones", () => {
    const { container } = render(<PlasticBanPage locale="en-US" page={page} />);

    expect(container.querySelectorAll("hr")).toHaveLength(sectionIndices.length);
  });

  it("renders the section-7 and section-9 CTAs as usa-button links to the authored URLs", () => {
    render(<PlasticBanPage locale="en-US" page={page} />);

    for (const index of [7, 9]) {
      const linkText = page[`link-text-${index}`] as string;
      const linkUrl = page[`link-url-${index}`] as string;
      const link = screen.getByRole("link", { name: new RegExp(linkText) });
      expect(link).toHaveClass("usa-button");
      expect(link).toHaveClass("margin-top-105");
      expect(link).toHaveAttribute("href", linkUrl);
    }
  });

  it("renders authored prose images with non-empty alt text", () => {
    const { container } = render(<PlasticBanPage locale="en-US" page={page} />);

    const images = container.querySelectorAll(".usa-prose img");
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image.getAttribute("alt")).toBeTruthy();
    }
  });

  it("renders authored prose video embeds with non-empty titles", () => {
    const { container } = render(<PlasticBanPage locale="en-US" page={page} />);

    const iframes = container.querySelectorAll(".usa-prose iframe");
    expect(iframes.length).toBeGreaterThan(0);
    for (const iframe of iframes) {
      expect(iframe.getAttribute("title")).toBeTruthy();
    }
  });

  it("skips index gaps and preserves ascending order", () => {
    const synthetic = syntheticPage({ "heading-2": "Second", "heading-4": "Fourth" });
    render(<PlasticBanPage locale="en-US" page={synthetic} />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(["Second", "Fourth"]);
  });

  it("degrades an unrecognized collapsible-N value to a plain section", () => {
    const synthetic = syntheticPage({ "heading-1": "Untrusted", "collapsible-1": "true" });
    render(<PlasticBanPage locale="en-US" page={synthetic} />);

    expect(screen.getByRole("heading", { level: 2, name: "Untrusted" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Untrusted" })).not.toBeInTheDocument();
  });

  it("drops a section defined only by link-text-N without a matching link-url-N", () => {
    const synthetic = syntheticPage({ "link-text-1": "Click here" });
    const { container } = render(<PlasticBanPage locale="en-US" page={synthetic} />);

    expect(container.querySelectorAll("section, hr")).toHaveLength(0);
  });
});
