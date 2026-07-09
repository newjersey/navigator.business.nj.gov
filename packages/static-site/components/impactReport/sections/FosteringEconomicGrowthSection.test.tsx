import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FosteringEconomicGrowthContent } from "@/domain/content/messageTypes";
import { FosteringEconomicGrowthSection } from "./FosteringEconomicGrowthSection";

const content: FosteringEconomicGrowthContent = {
  heading: "Fostering Economic Growth",
  paragraphs: ["Business.NJ.gov is a catalyst for economic growth."],
  stats: [
    { text: "**25 days faster** average time saved.", variant: "dark" },
    { text: "**$7k** estimated average additional earnings.", variant: "dark" },
    { text: "**$167.7M** estimated total additional earnings.", variant: "dark" },
  ],
  footnotes: [
    { id: 1, text: "This estimate was based on a survey." },
    { id: 2, text: "This metric is **provisional**." },
  ],
};

describe("FosteringEconomicGrowthSection", () => {
  it("renders the section heading", () => {
    render(<FosteringEconomicGrowthSection content={content} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Fostering Economic Growth" }),
    ).toBeInTheDocument();
  });

  it("renders all three stats as dark callout blocks", () => {
    const { container } = render(<FosteringEconomicGrowthSection content={content} />);
    expect(screen.getByText("25 days faster", { selector: "strong" })).toBeInTheDocument();
    expect(container.querySelectorAll(".impact-report-stat--dark")).toHaveLength(3);
  });

  it("renders footnotes with markdown bold spans", () => {
    render(<FosteringEconomicGrowthSection content={content} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("provisional", { selector: "strong" })).toBeInTheDocument();
  });
});
