import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AboutUsContent } from "@/domain/content/messageTypes";
import { AboutUsSection } from "./AboutUsSection";

const content: AboutUsContent = {
  heading: "About Us",
  introParagraph: "Business.NJ.gov is a **one-stop shop**.",
  resourcesParagraph: "Business.NJ.gov provides a wide range of resources, including:",
  image: {
    src: "/img/impact-report/about-us.jpg",
    alt: "A New Jersey business owner sitting at their desk.",
  },
  closingParagraph: "This report outlines the impact of Business.NJ.gov.",
  quote: {
    text: "We will create a first-stop, single digital portal.",
    attribution: "Governor Murphy’s Stronger and Fairer Economic Plan",
  },
  stats: [
    { text: "**39,768,502** times content appeared in search results." },
    { text: "**10,846,068** total visits." },
    { text: "**3,175,826** total visits, second period." },
  ],
};

describe("AboutUsSection", () => {
  it("renders the section heading", () => {
    render(<AboutUsSection content={content} />);
    expect(screen.getByRole("heading", { level: 2, name: "About Us" })).toBeInTheDocument();
  });

  it("renders the intro and closing paragraphs as markdown, including bold spans", () => {
    render(<AboutUsSection content={content} />);
    expect(screen.getByText("one-stop shop", { selector: "strong" })).toBeInTheDocument();
    expect(
      screen.getByText("This report outlines the impact of Business.NJ.gov."),
    ).toBeInTheDocument();
  });

  it("renders the resources paragraph beside the image", () => {
    render(<AboutUsSection content={content} />);
    expect(
      screen.getByText("Business.NJ.gov provides a wide range of resources, including:"),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("A New Jersey business owner sitting at their desk."),
    ).toBeInTheDocument();
  });

  it("renders the highlighted quote and attribution", () => {
    render(<AboutUsSection content={content} />);
    expect(
      screen.getByText("We will create a first-stop, single digital portal."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Governor Murphy’s Stronger and Fairer Economic Plan"),
    ).toBeInTheDocument();
  });

  it("renders all three stats as bulleted list items with bolded figures", () => {
    render(<AboutUsSection content={content} />);
    expect(screen.getByText("39,768,502", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("10,846,068", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("3,175,826", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
