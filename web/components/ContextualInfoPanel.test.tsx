import { withContextualInfo } from "@/test/helpers";
import { ContextualInfoPanel } from "./ContextualInfoPanel";
import { render, RenderResult } from "@testing-library/react";

describe("<ContextualInfoPanel />", () => {
  it("is closed when contextual info is empty", () => {
    const subject = render(withContextualInfo(<ContextualInfoPanel />, "", jest.fn()));
    expectToBeClosed(subject);
  });

  it("is open when the content is set", () => {
    const subject = render(withContextualInfo(<ContextualInfoPanel />, "some content", jest.fn()));
    expectToBeOpen(subject);
  });

  it("displays the content as markdown", () => {
    const subject = render(
      withContextualInfo(<ContextualInfoPanel />, "# a header\n\na paragraph", jest.fn())
    );
    expect(subject.getByText("a header")).toBeInTheDocument();
    expect(subject.getByText("a paragraph")).toBeInTheDocument();
  });

  const expectToBeClosed = (subject: RenderResult) => {
    expect(subject.getByTestId("overlay").className).not.toContain("is-visible");
    expect(subject.queryByTestId("info-panel")).not.toBeInTheDocument();
  };

  const expectToBeOpen = (subject: RenderResult) => {
    expect(subject.getByTestId("overlay").className).toContain("is-visible");
    expect(subject.getByTestId("info-panel").className).toContain("is-visible");
  };
});
