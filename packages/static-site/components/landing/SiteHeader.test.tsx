import { fireEvent, render, screen } from "@testing-library/react";
import { useLocale } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/landing/SiteHeader";
import type {
  LayoutHeaderContent,
  LayoutLanguageSwitcherContent,
} from "@/domain/content/messageTypes";

vi.mock("next-intl", () => {
  return { useLocale: vi.fn() };
});

const mockedUseLocale = vi.mocked(useLocale);

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

const defaultLanguageSwitcher: LayoutLanguageSwitcherContent = {
  navigationAriaLabel: "Language",
  buttonLabel: "Language",
  currentLanguageLabel: "(current)",
};

describe("SiteHeader", () => {
  beforeEach(() => {
    mockedUseLocale.mockReturnValue("en-US");
  });

  it("renders the logo image", () => {
    render(<SiteHeader content={defaultContent} languageSwitcher={defaultLanguageSwitcher} />);
    const logos = screen.getAllByAltText(defaultContent.logoAlt);
    expect(logos.length).toBeGreaterThan(0);
    expect(logos[0].tagName).toBe("IMG");
  });

  it("renders the hamburger button", () => {
    render(<SiteHeader content={defaultContent} languageSwitcher={defaultLanguageSwitcher} />);
    expect(
      screen.getByRole("button", { name: defaultContent.hamburgerButtonAriaLabel }),
    ).toBeInTheDocument();
  });

  it("renders the mobile account icon button", () => {
    render(<SiteHeader content={defaultContent} languageSwitcher={defaultLanguageSwitcher} />);
    expect(
      screen.getByRole("button", { name: defaultContent.mobileAccountButtonAriaLabel }),
    ).toBeInTheDocument();
  });

  it("opens the nav drawer when hamburger button is clicked", () => {
    render(<SiteHeader content={defaultContent} languageSwitcher={defaultLanguageSwitcher} />);
    const hamburger = screen.getByRole("button", { name: defaultContent.hamburgerButtonAriaLabel });
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the nav drawer when its close button is clicked", () => {
    render(<SiteHeader content={defaultContent} languageSwitcher={defaultLanguageSwitcher} />);
    const hamburger = screen.getByRole("button", { name: defaultContent.hamburgerButtonAriaLabel });
    fireEvent.click(hamburger);
    const closeButtons = screen.getAllByRole("button", {
      name: defaultContent.closeDrawerAriaLabel,
    });
    fireEvent.click(closeButtons[0]);
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the account drawer when account icon is clicked", () => {
    render(<SiteHeader content={defaultContent} languageSwitcher={defaultLanguageSwitcher} />);
    const accountBtn = screen.getByRole("button", {
      name: defaultContent.mobileAccountButtonAriaLabel,
    });
    fireEvent.click(accountBtn);
    expect(accountBtn).toHaveAttribute("aria-expanded", "true");
  });

  it("nav drawer and account drawer are independent", () => {
    render(<SiteHeader content={defaultContent} languageSwitcher={defaultLanguageSwitcher} />);
    fireEvent.click(screen.getByRole("button", { name: defaultContent.hamburgerButtonAriaLabel }));
    expect(
      screen.getByRole("button", { name: defaultContent.hamburgerButtonAriaLabel }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: defaultContent.mobileAccountButtonAriaLabel }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});
