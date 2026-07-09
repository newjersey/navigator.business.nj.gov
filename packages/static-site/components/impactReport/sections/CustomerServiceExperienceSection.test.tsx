import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CustomerServiceExperienceContent } from "@/domain/content/messageTypes";
import { CustomerServiceExperienceSection } from "./CustomerServiceExperienceSection";

const content: CustomerServiceExperienceContent = {
  heading: "Unifying the Customer Service Experience",
  beforeQuoteParagraphs: ["Business.NJ.gov enhances customer service."],
  quote: {
    text: "I've registered at least 10 companies over my career.",
    attribution: "Business.NJ.gov user",
  },
  afterQuoteParagraphs: ["The Live Chat also streamlines interagency communication."],
  imageRowParagraphs: [
    "Tens of thousands of New Jersey business owners have relied on Live Chat.",
    "New Jerseyans that have relied on the Live Chat report high satisfaction rates.",
  ],
  image: {
    src: "/img/impact-report/customer-service.jpg",
    alt: "A New Jersey business owner is laughing in their office.",
  },
  stats: [
    { text: "**165,267** conversations in Live Chat." },
    { text: "**5** agencies participating in Live Chat." },
  ],
};

describe("CustomerServiceExperienceSection", () => {
  it("renders the section heading", () => {
    render(<CustomerServiceExperienceSection content={content} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Unifying the Customer Service Experience" }),
    ).toBeInTheDocument();
  });

  it("renders the beforeQuote paragraph before the quote", () => {
    render(<CustomerServiceExperienceSection content={content} />);
    const paragraph = screen.getByText("Business.NJ.gov enhances customer service.");
    const quote = screen.getByText("I've registered at least 10 companies over my career.");
    expect(
      paragraph.compareDocumentPosition(quote) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the quote before the afterQuote paragraph", () => {
    render(<CustomerServiceExperienceSection content={content} />);
    const quote = screen.getByText("I've registered at least 10 companies over my career.");
    const paragraph = screen.getByText("The Live Chat also streamlines interagency communication.");
    expect(
      quote.compareDocumentPosition(paragraph) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the attribution", () => {
    render(<CustomerServiceExperienceSection content={content} />);
    expect(screen.getByText("Business.NJ.gov user")).toBeInTheDocument();
  });

  it("renders the imageRowParagraphs beside the image", () => {
    render(<CustomerServiceExperienceSection content={content} />);
    expect(
      screen.getByText("Tens of thousands of New Jersey business owners have relied on Live Chat."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "New Jerseyans that have relied on the Live Chat report high satisfaction rates.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("A New Jersey business owner is laughing in their office."),
    ).toBeInTheDocument();
  });

  it("renders all stats as bulleted list items", () => {
    render(<CustomerServiceExperienceSection content={content} />);
    expect(screen.getByText("165,267", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("5", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
