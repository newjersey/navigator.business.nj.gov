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
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toMatchSnapshot();
  });
  it("matches the layout with a due date", () => {
    const opportunity = {
      id: "test",
      name: "test",
      contentMd: "**Test Content",
      urlSlug: "",
      dueDate: "09/01/2030",
    };
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toMatchSnapshot();
  });
  it("matches the layout when status is first come first serve", () => {
    const opportunity = {
      id: "test",
      name: "test",
      contentMd: "**Test Content",
      urlSlug: "",
      dueDate: "",
      status: "first come, first serve",
    };
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toMatchSnapshot();
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
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toMatchSnapshot();
  });
  it("contains the correct name", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "**Test Content",
      urlSlug: "",
    };
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toHaveTextContent("Test Name for Card");
  });
  it("renders the content correctly", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
    };
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toContainHTML("<em>Test Content</em>");
  });
  it("renders with due date correctly", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
      dueDate: "09/01/2030",
    };
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toHaveTextContent("Due:");
    expect(view).toHaveTextContent("09/01/2030");
  });
  it("renders with text of First Come First Serve correctly", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
      dueDate: "",
      status: "first come, first serve",
    };
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toContainHTML("First Come, First Serve");
  });
  it("does not render due date if status is first come, first serve", () => {
    const opportunity = {
      id: "test",
      name: "Test Name for Card",
      contentMd: "*Test Content*",
      urlSlug: "",
      dueDate: "09/03/30",
      status: "first come, first serve",
    };
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).not.toHaveTextContent("Due:");
    expect(view).toContainHTML("First Come, First Serve");
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
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).toContainHTML("Rolling Application");
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
    const view = render(<OpportunityCard opportunity={opportunity} urlPath="funding" />).baseElement;
    expect(view).not.toHaveTextContent("Due:");
    expect(view).toContainHTML("Rolling Application");
  });
});
