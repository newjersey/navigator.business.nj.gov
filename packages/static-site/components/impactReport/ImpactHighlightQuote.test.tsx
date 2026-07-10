import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ImpactReportQuote } from "@/domain/content/messageTypes";
import { ImpactHighlightQuote } from "./ImpactHighlightQuote";

const quote: ImpactReportQuote = {
  text: "This tool is awesome.",
  attribution: "Business.NJ.gov user",
};

describe("ImpactHighlightQuote", () => {
  it("renders the quote text inside a blockquote", () => {
    render(<ImpactHighlightQuote quote={quote} />);
    const blockquote = screen.getByText("This tool is awesome.", { selector: "blockquote *" });
    expect(blockquote).toBeInTheDocument();
  });

  it("renders the attribution as a cite", () => {
    render(<ImpactHighlightQuote quote={quote} />);
    expect(screen.getByText("Business.NJ.gov user", { selector: "cite" })).toBeInTheDocument();
  });
});
