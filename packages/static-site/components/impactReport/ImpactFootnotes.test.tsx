import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ImpactReportFootnote } from "@/domain/content/messageTypes";
import { ImpactFootnotes } from "./ImpactFootnotes";

const footnotes: readonly ImpactReportFootnote[] = [
  { id: 1, text: "This estimate was based on a survey of business owners." },
  { id: 2, text: "This metric is **provisional** and subject to revision." },
];

describe("ImpactFootnotes", () => {
  it("renders each footnote as a list item", () => {
    render(<ImpactFootnotes footnotes={footnotes} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders markdown bold spans as strong elements", () => {
    render(<ImpactFootnotes footnotes={footnotes} />);
    expect(screen.getByText("provisional", { selector: "strong" })).toBeInTheDocument();
  });

  it("gives each footnote an id matching its explicit id for anchor links", () => {
    const { container } = render(<ImpactFootnotes footnotes={footnotes} />);
    expect(container.querySelector("#impact-report-footnote-1")).toHaveTextContent(
      footnotes[0].text,
    );
    expect(container.querySelector("#impact-report-footnote-2")).toHaveTextContent("provisional");
  });

  it("uses each footnote's explicit id rather than its array position", () => {
    const outOfOrderFootnotes: readonly ImpactReportFootnote[] = [
      { id: 2, text: "Second footnote text, listed first." },
      { id: 1, text: "First footnote text, listed second." },
    ];
    const { container } = render(<ImpactFootnotes footnotes={outOfOrderFootnotes} />);

    expect(container.querySelector("#impact-report-footnote-2")).toHaveTextContent(
      "Second footnote text, listed first.",
    );
    expect(container.querySelector("#impact-report-footnote-1")).toHaveTextContent(
      "First footnote text, listed second.",
    );
  });

  it("renders a back-link to the footnote's citation with an accessible name", () => {
    render(<ImpactFootnotes footnotes={footnotes} />);

    const backLink = screen.getByRole("link", { name: "Back to content for footnote 1" });
    expect(backLink).toHaveAttribute("href", "#impact-report-citation-1");
  });
});
