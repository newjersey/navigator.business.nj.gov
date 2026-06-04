import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeaderAuthButtons } from "@/components/landing/HeaderAuthButtons";

const defaultProps = {
  logInLabel: "Log In",
  myAccountLabel: "My Account",
  getStartedLabel: "Get Started",
  accountIconAlt: "Account icon",
  dropdownArrowAlt: "Open My Account menu",
  accountAppUrl: "https://account.business.nj.gov",
};

describe("HeaderAuthButtons", () => {
  it("renders the Log In link pointing to the login URL", () => {
    render(<HeaderAuthButtons {...defaultProps} />);
    const link = screen.getByRole("link", { name: defaultProps.logInLabel });
    expect(link).toHaveAttribute("href", `${defaultProps.accountAppUrl}/login`);
  });

  it("renders the My Account button", () => {
    render(<HeaderAuthButtons {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: new RegExp(defaultProps.myAccountLabel, "i") }),
    ).toBeInTheDocument();
  });

  it("does not show the Get Started dropdown by default", () => {
    render(<HeaderAuthButtons {...defaultProps} />);
    expect(
      screen.queryByRole("link", { name: defaultProps.getStartedLabel }),
    ).not.toBeInTheDocument();
  });

  it("shows the Get Started dropdown when My Account button is clicked", () => {
    render(<HeaderAuthButtons {...defaultProps} />);
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(defaultProps.myAccountLabel, "i") }),
    );
    expect(screen.getByRole("link", { name: defaultProps.getStartedLabel })).toBeInTheDocument();
  });

  it("Get Started link points to the account app URL", () => {
    render(<HeaderAuthButtons {...defaultProps} />);
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(defaultProps.myAccountLabel, "i") }),
    );
    expect(screen.getByRole("link", { name: defaultProps.getStartedLabel })).toHaveAttribute(
      "href",
      defaultProps.accountAppUrl,
    );
  });

  it("closes the dropdown when My Account button is clicked a second time", () => {
    render(<HeaderAuthButtons {...defaultProps} />);
    const button = screen.getByRole("button", {
      name: new RegExp(defaultProps.myAccountLabel, "i"),
    });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(
      screen.queryByRole("link", { name: defaultProps.getStartedLabel }),
    ).not.toBeInTheDocument();
  });

  it("uses the provided accountAppUrl for the login link", () => {
    const overrideUrl = "http://localhost:3000";
    render(<HeaderAuthButtons {...defaultProps} accountAppUrl={overrideUrl} />);
    expect(screen.getByRole("link", { name: defaultProps.logInLabel })).toHaveAttribute(
      "href",
      `${overrideUrl}/login`,
    );
  });
});

describe("HeaderAuthButtons — dropdown dismissal", () => {
  it("My Account button has aria-haspopup", () => {
    render(<HeaderAuthButtons {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: new RegExp(defaultProps.myAccountLabel, "i") }),
    ).toHaveAttribute("aria-haspopup", "true");
  });

  it("closes the dropdown when Escape is pressed", () => {
    render(<HeaderAuthButtons {...defaultProps} />);
    const button = screen.getByRole("button", {
      name: new RegExp(defaultProps.myAccountLabel, "i"),
    });
    fireEvent.click(button);
    expect(screen.getByRole("link", { name: defaultProps.getStartedLabel })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("link", { name: defaultProps.getStartedLabel }),
    ).not.toBeInTheDocument();
  });

  it("closes the dropdown when clicking outside the account menu", () => {
    render(
      <div>
        <HeaderAuthButtons {...defaultProps} />
        <button type="button">Outside</button>
      </div>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(defaultProps.myAccountLabel, "i") }),
    );
    expect(screen.getByRole("link", { name: defaultProps.getStartedLabel })).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
    expect(
      screen.queryByRole("link", { name: defaultProps.getStartedLabel }),
    ).not.toBeInTheDocument();
  });
});
