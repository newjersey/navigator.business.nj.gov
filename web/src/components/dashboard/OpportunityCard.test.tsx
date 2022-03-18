import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { render } from "@testing-library/react";
import React from "react";

describe("OpportunityCard", () => {
  it("matches the layout", () => {
    const opportunity = {
      id: "test",
      name: "test",
      contentMd: "**Test Content",
      urlSlug: "",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("contains the correct name", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "**Test Content",
      urlSlug: "",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).toHaveTextContent("Test Name for Card");
  });
  it("renders the content correctly", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).toContainHTML("<em>Test Content</em>");
  });
});
