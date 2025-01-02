import { ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { fireEvent, render, screen } from "@testing-library/react";

const showText = "show";
const hideText = "hide";
const showOverrideText = "show-override";
const hideOverrideText = "hide-override";

const toggleMock = vi.fn();

const renderButton = ({
  status,
  useOverrideText,
}: {
  status: "text-view" | "password-view";
  useOverrideText?: boolean;
}): void => {
  if (useOverrideText) {
    render(
      <ShowHideToggleButton
        status={status}
        toggle={toggleMock}
        hideText={hideText}
        showText={showText}
        useOverrideText={useOverrideText}
        showOverrideText={showOverrideText}
        hideOverrideText={hideOverrideText}
      />
    );
  } else {
    render(
      <ShowHideToggleButton status={status} toggle={toggleMock} hideText={hideText} showText={showText} />
    );
  }
};

describe("<ShowHideToggleButton/>", () => {
  it("renders with the hide text when status is text-view", () => {
    renderButton({ status: "text-view" });
    expect(screen.getByText(hideText)).toBeInTheDocument();
  });

  it("renders with the show text when status is password-view", () => {
    renderButton({ status: "password-view" });
    expect(screen.getByText(showText)).toBeInTheDocument();
  });

  it("renders with the override show text when status is password-view and override is true", () => {
    renderButton({ status: "password-view", useOverrideText: true });
    expect(screen.getByText(showOverrideText)).toBeInTheDocument();
  });

  it("renders with the override hide text when status is text-view and override is true", () => {
    renderButton({ status: "text-view", useOverrideText: true });
    expect(screen.getByText(hideOverrideText)).toBeInTheDocument();
  });

  it("triggers toggle function when clicked", () => {
    renderButton({ status: "text-view" });
    fireEvent.click(screen.getByText(hideText));
    expect(toggleMock).toHaveBeenCalled();
  });
});
