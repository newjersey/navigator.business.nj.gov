import { OpportunityCardStatus } from "@/components/dashboard/OpportunityCardStatus";
import { render } from "@testing-library/react";

describe("OpportunityCard", () => {
  it("renders with due date correctly", () => {
    const view = render(<OpportunityCardStatus dueDate="09/01/2030" />).baseElement;
    expect(view).toHaveTextContent("Due:");
    expect(view).toHaveTextContent("09/01/2030");
  });

  it("renders with text of First Come First Serve correctly", () => {
    const view = render(<OpportunityCardStatus status="first come, first serve" />).baseElement;
    expect(view).toContainHTML("First Come, First Serve");
  });

  it("does not render due date if status is first come, first serve", () => {
    const view = render(
      <OpportunityCardStatus dueDate="09/03/30" status="first come, first serve" />,
    ).baseElement;
    expect(view).not.toHaveTextContent("Due:");
    expect(view).toContainHTML("First Come, First Serve");
  });

  it("renders with text of Rolling Application correctly", () => {
    const view = render(<OpportunityCardStatus status="rolling application" />).baseElement;
    expect(view).toContainHTML("Rolling Application");
  });

  it("does not render due date if status is rolling application", () => {
    const view = render(
      <OpportunityCardStatus dueDate="09/03/30" status="rolling application" />,
    ).baseElement;
    expect(view).not.toHaveTextContent("Due:");
    expect(view).toContainHTML("Rolling Application");
  });
});
