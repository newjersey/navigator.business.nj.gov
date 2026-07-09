import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AwarenessAndComplianceContent } from "@/domain/content/messageTypes";
import { AwarenessAndComplianceSection } from "./AwarenessAndComplianceSection";

const content: AwarenessAndComplianceContent = {
  heading: "Awareness of and Compliance with Permits, Funding, and More",
  paragraphs: ["Business.NJ.gov enhances access and government transparency."],
  stats: [{ text: "**275,555** newsletter subscribers." }, { text: "**287** permits explained." }],
  quote: {
    text: "This road map helped me and saved me hundreds.",
    attribution: "Business.NJ.gov user",
  },
};

describe("AwarenessAndComplianceSection", () => {
  it("renders the section heading", () => {
    render(<AwarenessAndComplianceSection content={content} />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Awareness of and Compliance with Permits, Funding, and More",
      }),
    ).toBeInTheDocument();
  });

  it("renders all stats as bulleted list items", () => {
    render(<AwarenessAndComplianceSection content={content} />);
    expect(screen.getByText("275,555", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("287", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders the quote after the stats", () => {
    render(<AwarenessAndComplianceSection content={content} />);
    const stats = screen.getByRole("list");
    const quote = screen.getByText("This road map helped me and saved me hundreds.");
    expect(stats.compareDocumentPosition(quote) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
