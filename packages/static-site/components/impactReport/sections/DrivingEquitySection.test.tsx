import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DrivingEquityContent } from "@/domain/content/messageTypes";
import { DrivingEquitySection } from "./DrivingEquitySection";

const content: DrivingEquityContent = {
  heading: "Driving Equity and Accessibility",
  paragraphs: ["Business.NJ.gov has significantly improved equity and accessibility."],
  stats: [
    { text: "**70%** approximate year-over-year growth in sessions." },
    { text: "**100%** of pages translated into Spanish." },
    { text: "**40,748** visits to Spanish language content." },
  ],
};

describe("DrivingEquitySection", () => {
  it("renders the section heading", () => {
    render(<DrivingEquitySection content={content} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Driving Equity and Accessibility" }),
    ).toBeInTheDocument();
  });

  it("renders all three stats as bulleted list items", () => {
    render(<DrivingEquitySection content={content} />);
    expect(screen.getByText("70%", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("100%", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("40,748", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
