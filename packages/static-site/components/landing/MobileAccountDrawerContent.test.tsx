import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MobileAccountDrawerContent } from "@/components/landing/MobileAccountDrawerContent";

const defaultProps = {
  getStartedLabel: "Get Started",
  logInLabel: "Log In",
  accountAppUrl: "https://account.business.nj.gov",
};

describe("MobileAccountDrawerContent", () => {
  it("renders the Get Started link", () => {
    render(<MobileAccountDrawerContent {...defaultProps} />);
    expect(
      screen.getByRole("link", { name: new RegExp(defaultProps.getStartedLabel, "i") }),
    ).toBeInTheDocument();
  });

  it("renders the Log In link", () => {
    render(<MobileAccountDrawerContent {...defaultProps} />);
    expect(
      screen.getByRole("link", { name: new RegExp(defaultProps.logInLabel, "i") }),
    ).toBeInTheDocument();
  });

  it("Get Started links to the account app URL", () => {
    render(<MobileAccountDrawerContent {...defaultProps} />);
    expect(
      screen.getByRole("link", { name: new RegExp(defaultProps.getStartedLabel, "i") }),
    ).toHaveAttribute("href", defaultProps.accountAppUrl);
  });

  it("Log In links to the account app login URL", () => {
    render(<MobileAccountDrawerContent {...defaultProps} />);
    expect(
      screen.getByRole("link", { name: new RegExp(defaultProps.logInLabel, "i") }),
    ).toHaveAttribute("href", `${defaultProps.accountAppUrl}/login`);
  });
});
