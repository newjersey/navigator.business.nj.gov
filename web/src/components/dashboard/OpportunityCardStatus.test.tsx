import { OpportunityCardStatus } from "@/components/dashboard/OpportunityCardStatus";
import { render } from "@testing-library/react";
import React from "react";

describe("OpportunityCard", () => {
  it("matches the layout", () => {
    const subject = render(<OpportunityCardStatus />).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("matches the layout with a due date", () => {
    const subject = render(<OpportunityCardStatus dueDate="09/01/2030" />).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("matches the layout when status is first come first serve", () => {
    const subject = render(<OpportunityCardStatus status="first come, first serve" />).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("matches the layout when status is rolling application", () => {
    const subject = render(<OpportunityCardStatus status="rolling application" />).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("renders with due date correctly", () => {
    const subject = render(<OpportunityCardStatus dueDate="09/01/2030" />).baseElement;
    expect(subject).toHaveTextContent("Due:");
    expect(subject).toHaveTextContent("09/01/2030");
  });
  it("renders with text of First Come First Serve correctly", () => {
    const subject = render(<OpportunityCardStatus status="first come, first serve" />).baseElement;
    expect(subject).toContainHTML("First Come, First Serve");
  });
  it("does not render due date if status is first come, first serve", () => {
    const subject = render(
      <OpportunityCardStatus dueDate="09/03/30" status="first come, first serve" />
    ).baseElement;
    expect(subject).not.toHaveTextContent("Due:");
    expect(subject).toContainHTML("First Come, First Serve");
  });
  it("renders with text of Rolling Application correctly", () => {
    const subject = render(<OpportunityCardStatus status="rolling application" />).baseElement;
    expect(subject).toContainHTML("Rolling Application");
  });
  it("does not render due date if status is rolling application", () => {
    const subject = render(
      <OpportunityCardStatus dueDate="09/03/30" status="rolling application" />
    ).baseElement;
    expect(subject).not.toHaveTextContent("Due:");
    expect(subject).toContainHTML("Rolling Application");
  });
});
