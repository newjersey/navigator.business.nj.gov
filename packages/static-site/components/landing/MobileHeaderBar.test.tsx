import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileHeaderBar } from "@/components/landing/MobileHeaderBar";
import type { LayoutHeaderContent } from "@/domain/content/messageTypes";

const defaultContent: LayoutHeaderContent = {
  siteTitle: "Business.NJ.Gov",
  logoAlt: "Business.NJ.gov logo",
  homeLinkAriaLabel: "Business.NJ.gov home",
  homeLinkTitle: "Home",
  homeLink: { href: "/en-US", label: "Home", isInternal: true, opensInNewTab: false },
  closeButtonAlt: "Close",
  primaryNavigationAriaLabel: "Primary navigation",
  primaryItems: [],
  secondaryLinks: [],
  searchAction: "/search",
  searchInputLabel: "Search",
  searchSubmitIconAlt: "Submit search",
  logInLabel: "Log In",
  myAccountLabel: "My Account",
  getStartedLabel: "Get Started",
  accountIconAlt: "Account icon",
  dropdownArrowAlt: "Open My Account menu",
  hamburgerButtonAriaLabel: "Open navigation menu",
  mobileAccountButtonAriaLabel: "Open account menu",
  navDrawerTitle: "Business.NJ.gov",
  closeDrawerAriaLabel: "Close menu",
};

describe("MobileHeaderBar", () => {
  it("renders the logo image", () => {
    render(
      <MobileHeaderBar
        content={defaultContent}
        isAccountOpen={false}
        isNavOpen={false}
        onAccountOpen={vi.fn()}
        onNavOpen={vi.fn()}
      />,
    );
    expect(screen.getByAltText("Business.NJ.gov logo")).toBeInTheDocument();
  });

  it("calls onNavOpen when hamburger button is clicked", () => {
    const onNavOpen = vi.fn();
    render(
      <MobileHeaderBar
        content={defaultContent}
        isAccountOpen={false}
        isNavOpen={false}
        onAccountOpen={vi.fn()}
        onNavOpen={onNavOpen}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(onNavOpen).toHaveBeenCalledTimes(1);
  });

  it("calls onAccountOpen when account icon button is clicked", () => {
    const onAccountOpen = vi.fn();
    render(
      <MobileHeaderBar
        content={defaultContent}
        isAccountOpen={false}
        isNavOpen={false}
        onAccountOpen={onAccountOpen}
        onNavOpen={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open account menu" }));
    expect(onAccountOpen).toHaveBeenCalledTimes(1);
  });
});
