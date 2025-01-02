import { ContextualInfoPanel } from "@/components/ContextualInfoPanel";
import { withContextualInfo } from "@/test/helpers/helpers-renderers";
import { render, screen } from "@testing-library/react";

describe("<ContextualInfoPanel />", () => {
  it("is closed when contextual info is empty", () => {
    render(
      withContextualInfo(<ContextualInfoPanel />, { isVisible: false, header: "", markdown: "" }, vi.fn())
    );
    expect(screen.getByTestId("overlay")).not.toHaveClass("is-visible");
    expect(screen.queryByTestId("info-panel")).not.toBeInTheDocument();
  });

  it("is open when the content is set", () => {
    render(
      withContextualInfo(
        <ContextualInfoPanel />,
        { isVisible: true, header: "some header", markdown: "some content" },
        vi.fn()
      )
    );
    expect(screen.getByTestId("overlay")).toHaveClass("is-visible");
    expect(screen.getByTestId("info-panel")).toHaveClass("is-visible");
  });

  it("displays the content as markdown", () => {
    render(
      withContextualInfo(
        <ContextualInfoPanel />,
        { isVisible: true, header: "a header", markdown: "a paragraph" },
        vi.fn()
      )
    );
    expect(screen.getByText("a header")).toBeInTheDocument();
    expect(screen.getByText("a paragraph")).toBeInTheDocument();
  });
});
