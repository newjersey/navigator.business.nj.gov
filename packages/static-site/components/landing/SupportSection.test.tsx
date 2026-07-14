import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SupportSection } from "@/components/landing/SupportSection";
import type { SupportSectionContent } from "@/domain/content/messageTypes";

const mockSupportSectionContent: SupportSectionContent = {
  title: "For More Support",
  description: "Find additional resources to help your business succeed.",
  businessNjGovCard: {
    title: "Business.NJ.gov",
    description: "Access comprehensive business resources and services",
    iconPath: "/icons/business-nj.svg",
    iconAlt: "Business NJ icon",
    link: {
      label: "Visit Business.NJ.gov",
      href: "https://business.nj.gov",
      isInternal: false,
      opensInNewTab: true,
    },
  },
  oneOnOneSupportCard: {
    title: "One-on-One Support",
    description: "Get personalized assistance from our business experts",
    iconPath: "/icons/support.svg",
    iconAlt: "Support icon",
  },
  businessUpdates: {
    title: "Business Updates",
    description: "Get the latest news and updates for your business",
    iconPath: "/icons/updates.svg",
    iconAlt: "Updates icon",
    link: {
      label: "Request Letter",
      href: "/services/letters",
      isInternal: true,
      opensInNewTab: false,
    },
  },
};

describe("SupportSection", () => {
  it("renders all three support cards", () => {
    render(<SupportSection content={mockSupportSectionContent} />);

    expect(
      screen.getByRole("heading", { name: mockSupportSectionContent.businessNjGovCard.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: mockSupportSectionContent.oneOnOneSupportCard.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: mockSupportSectionContent.businessUpdates.title }),
    ).toBeInTheDocument();
  });

  describe("SupportCardElement (businessNjGovCard and businessUpdates)", () => {
    it("renders cards with links as clickable links", () => {
      render(<SupportSection content={mockSupportSectionContent} />);

      const businessNjLink = screen.getByRole("link", {
        name: new RegExp(mockSupportSectionContent.businessNjGovCard.title, "i"),
      });
      const businessUpdatesLink = screen.getByRole("link", {
        name: new RegExp(mockSupportSectionContent.businessUpdates.title, "i"),
      });

      expect(businessNjLink).toBeInTheDocument();
      expect(businessNjLink).toHaveAttribute(
        "href",
        mockSupportSectionContent.businessNjGovCard.link.href,
      );

      expect(businessUpdatesLink).toBeInTheDocument();
      expect(businessUpdatesLink).toHaveAttribute(
        "href",
        mockSupportSectionContent.businessUpdates.link.href,
      );
    });
  });

  describe("OneOnOneSupportCard", () => {
    it("renders as a button with the intercomlaunch class", () => {
      render(<SupportSection content={mockSupportSectionContent} />);

      const supportButton = screen.getByRole("button", {
        name: mockSupportSectionContent.oneOnOneSupportCard.title,
      });

      expect(supportButton).toBeInTheDocument();
      expect(supportButton).toHaveClass("intercomlaunch");
      expect(supportButton).toHaveAttribute("type", "button");
    });
  });
});
