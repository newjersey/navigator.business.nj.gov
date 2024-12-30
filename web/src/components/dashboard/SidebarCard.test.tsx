import { SidebarCard } from "@/components/dashboard/SidebarCard";
import { generateSidebarCardContent } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("<SidebarCard />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
    useMockRoadmap({});
    useMockRouter({});
  });

  it("renders SidebarCardFundingNudge for id funding-nudge", () => {
    const card = generateSidebarCardContent({ id: SIDEBAR_CARDS.fundingNudge, ctaText: "Click me" });
    render(<SidebarCard card={card} />);
    expect(screen.getByTestId("cta-funding-nudge")).toBeInTheDocument();
  });

  it("renders header and content from card", () => {
    const card = generateSidebarCardContent({ header: "some-header" });
    render(<SidebarCard card={card} />);
    expect(screen.getByText("some-header")).toBeInTheDocument();
    expect(screen.getByText(card.contentMd)).toBeInTheDocument();
  });

  it("renders close button when hasCloseButton true", () => {
    const card = generateSidebarCardContent({ hasCloseButton: true });
    render(<SidebarCard card={card} />);
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  it("does not render close button when hasCloseButton false", () => {
    const card = generateSidebarCardContent({ hasCloseButton: false });
    render(<SidebarCard card={card} />);
    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });
});
