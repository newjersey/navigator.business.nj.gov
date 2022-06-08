import { ContextualInfoPanel } from "@/components/ContextualInfoPanel";
import { withContextualInfo } from "@/test/helpers";
import { render, screen } from "@testing-library/react";

describe("<ContextualInfoPanel />", () => {
  it("is closed when contextual info is empty", () => {
    render(
      withContextualInfo(<ContextualInfoPanel />, { isVisible: false, header: "", markdown: "" }, jest.fn())
    );
    expect(screen.getByTestId("overlay").className).not.toContain("is-visible");
    expect(screen.queryByTestId("info-panel")).not.toBeInTheDocument();
  });

  it("is open when the content is set", () => {
    render(
      withContextualInfo(
        <ContextualInfoPanel />,
        { isVisible: true, header: "some header", markdown: "some content" },
        jest.fn()
      )
    );
    expect(screen.getByTestId("overlay").className).toContain("is-visible");
    expect(screen.getByTestId("info-panel").className).toContain("is-visible");
  });

  it("displays the content as markdown", () => {
    render(
      withContextualInfo(
        <ContextualInfoPanel />,
        { isVisible: true, header: "a header", markdown: "a paragraph" },
        jest.fn()
      )
    );
    expect(screen.getByText("a header")).toBeInTheDocument();
    expect(screen.getByText("a paragraph")).toBeInTheDocument();
  });
});
