import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<ExpandCollapseString />", () => {
  let clientHeight: number;
  let scrollHeight: number;

  beforeEach(() => {
    clientHeight = 20;
    scrollHeight = 20;

    jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(() => {
      return clientHeight;
    });
    jest.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => {
      return scrollHeight;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = (text = "Some content"): ReturnType<typeof render> => {
    return render(
      <ExpandCollapseString
        text={text}
        lines={2}
        viewMoreText="View more"
        viewLessText="View less"
      />,
    );
  };

  it("does not show a toggle when the content fits", () => {
    renderComponent();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a toggle when the content overflows", () => {
    scrollHeight = 40;

    renderComponent();

    expect(screen.getByRole("button", { name: "View more" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("toggles the content and accessible expanded state", () => {
    scrollHeight = 40;

    renderComponent();
    const content = screen.getByText("Some content");

    expect(content).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(screen.getByRole("button", { name: "View more" }));

    expect(screen.getByRole("button", { name: "View less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(content).toHaveAttribute("aria-hidden", "false");

    fireEvent.click(screen.getByRole("button", { name: "View less" }));

    expect(screen.getByRole("button", { name: "View more" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(content).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the controlled content id stable across rerenders", () => {
    scrollHeight = 40;

    const { rerender } = renderComponent();
    const initialContentId = screen.getByRole("button").getAttribute("aria-controls");

    rerender(
      <ExpandCollapseString
        text="Updated content"
        lines={3}
        viewMoreText="View more"
        viewLessText="View less"
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-controls", initialContentId);
    expect(screen.getByText("Updated content")).toHaveAttribute("id", initialContentId);
  });
});
