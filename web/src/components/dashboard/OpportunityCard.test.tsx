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
  it("matches the layout with a due date", () => {
    const opportunity = {
      id: "test",
      name: "test",
      contentMd: "**Test Content",
      urlSlug: "",
      dueDate: "09/01/2030",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("matches the layout when status is first come first serve", () => {
    const opportunity = {
      id: "test",
      name: "test",
      contentMd: "**Test Content",
      urlSlug: "",
      dueDate: "",
      status: "first-come, first-served",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("matches the layout when status is rolling application", () => {
    const opportunity = {
      id: "test",
      name: "test",
      contentMd: "**Test Content",
      urlSlug: "",
      dueDate: "",
      status: "rolling application",
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
  it("renders with due date correctly", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
      dueDate: "09/01/2030",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).toHaveTextContent("Due:");
    expect(subject).toHaveTextContent("09/01/2030");
  });
  it("renders with text of First Come First Serve correctly", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
      dueDate: "",
      status: "first-come, first-served",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).toContainHTML("First Come, First Serve");
  });
  it("does not render due date if status is first-come, first-served", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
      dueDate: "09/03/30",
      status: "first-come, first-served",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).not.toHaveTextContent("Due:");
    expect(subject).toContainHTML("First Come, First Serve");
  });
  it("renders with text of Rolling Application correctly", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
      dueDate: "",
      status: "rolling application",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).toContainHTML("Rolling Application");
  });
  it("does not render due date if status is rolling application", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
      dueDate: "09/03/30",
      status: "rolling application",
    };
    const subject = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(subject).not.toHaveTextContent("Due:");
    expect(subject).toContainHTML("Rolling Application");
  });
});
