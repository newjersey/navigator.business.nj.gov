import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MakingItEasierContent } from "@/domain/content/messageTypes";
import { MakingItEasierSection } from "./MakingItEasierSection";

const content: MakingItEasierContent = {
  heading: "Making it Easier to Start and Grow a Business",
  beforeStatsParagraphs: ["Prior to Business.NJ.gov, starting a business was byzantine."],
  quote: {
    text: "I am truly thankful as a small business owner.",
    attribution: "Business.NJ.gov user",
  },
  stats: [
    { text: "On average, business owners start their business **30% faster**.", variant: "dark" },
    { text: "**502,994** visits to guides." },
    { text: "**57,079** businesses formed." },
  ],
  afterStatsParagraphs: ["One out of every seven businesses are now formed through it."],
};

describe("MakingItEasierSection", () => {
  it("renders the section heading", () => {
    render(<MakingItEasierSection content={content} />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Making it Easier to Start and Grow a Business",
      }),
    ).toBeInTheDocument();
  });

  it("renders the quote before the beforeStats paragraphs", () => {
    render(<MakingItEasierSection content={content} />);
    const heading = screen.getByRole("heading", { level: 2 });
    const quote = screen.getByText("I am truly thankful as a small business owner.");
    const paragraph = screen.getByText(
      "Prior to Business.NJ.gov, starting a business was byzantine.",
    );
    expect(heading.compareDocumentPosition(quote) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      quote.compareDocumentPosition(paragraph) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the dark callout stat with a bolded phrase", () => {
    const { container } = render(<MakingItEasierSection content={content} />);
    expect(screen.getByText("30% faster", { selector: "strong" })).toBeInTheDocument();
    expect(container.querySelectorAll(".impact-report-stat--dark")).toHaveLength(1);
  });

  it("renders the remaining stats as bulleted list items", () => {
    render(<MakingItEasierSection content={content} />);
    expect(screen.getByText("502,994", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("57,079", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders the afterStats paragraphs after the stat group", () => {
    render(<MakingItEasierSection content={content} />);
    const stats = screen.getByRole("list");
    const paragraph = screen.getByText(
      "One out of every seven businesses are now formed through it.",
    );
    expect(
      stats.compareDocumentPosition(paragraph) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
