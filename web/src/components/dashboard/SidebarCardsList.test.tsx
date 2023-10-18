import { SidebarCardsList, SidebarCardsListProps } from "@/components/dashboard/SidebarCardsList";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { generateCertification, generateFunding, generateSidebarCardContent } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      for_you_card_unhide_button: {
        click: {
          unhide_cards: jest.fn(),
        },
      },
    },
  };
}

const Config = getMergedConfig();

describe("<SidebarCardsList />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useMediaQuery as jest.Mock).mockImplementation(() => {
      return true;
    });
    useMockBusiness({});
  });

  const renderComponent = (overrides: Partial<SidebarCardsListProps>): void => {
    const sidebarCardsListProps = {
      topCards: [],
      bottomCards: [],
      fundings: [generateFunding({})],
      hiddenFundings: [generateFunding({})],
      certifications: [generateCertification({})],
      hiddenCertifications: [generateCertification({})],
      displayFundings: false,
      displayCertifications: false,
      ...overrides,
    };
    render(<SidebarCardsList {...sidebarCardsListProps} />);
  };

  it("fire unhide_cards analytics when accordion is opened when displayFundings is true", () => {
    render(
      <SidebarCardsList
        topCards={[]}
        bottomCards={[]}
        fundings={[]}
        hiddenFundings={[]}
        certifications={[]}
        hiddenCertifications={[]}
        displayFundings={true}
        displayCertifications={false}
      />
    );
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_cards).toHaveBeenCalledTimes(1);
  });

  it("fire unhide_cards analytics when accordion is opened when displayCertifications is true", () => {
    render(
      <SidebarCardsList
        topCards={[]}
        bottomCards={[]}
        fundings={[]}
        hiddenFundings={[]}
        certifications={[]}
        hiddenCertifications={[]}
        displayFundings={false}
        displayCertifications={true}
      />
    );
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_cards).toHaveBeenCalledTimes(1);
  });

  describe("empty state messaging", () => {
    it("displays Complete Required Tasks Message when there are no top or bottom cards and display Fundings and Certifications are false", () => {
      renderComponent({});
      expect(screen.getByTestId("complete-required-tasks-msg")).toBeInTheDocument();
      expect(screen.queryByText(Config.dashboardDefaults.emptyOpportunitiesText)).not.toBeInTheDocument();
    });

    it("does not display Complete Required Tasks Message when displayFundings is true", () => {
      renderComponent({ displayFundings: true });
      expect(screen.queryByTestId("complete-required-tasks-msg")).not.toBeInTheDocument();
    });

    it("does not display Complete Required Tasks Message when displayCertifications is true", () => {
      renderComponent({ displayCertifications: true });
      expect(screen.queryByTestId("complete-required-tasks-msg")).not.toBeInTheDocument();
    });

    it("does not display Complete Required Tasks Message when there are top cards", () => {
      const topCards = [
        generateSidebarCardContent({
          id: "some-fake-top-card",
          section: "above-opportunities",
        }),
      ];
      renderComponent({ topCards });

      expect(screen.queryByTestId("complete-required-tasks-msg")).not.toBeInTheDocument();
    });

    it("does not display Complete Required Tasks Message when there are bottom cards", () => {
      const bottomCards = [
        generateSidebarCardContent({
          id: "some-fake-bottom-card",
          section: "below-opportunities",
        }),
      ];

      renderComponent({ bottomCards });

      expect(screen.queryByTestId("complete-required-tasks-msg")).not.toBeInTheDocument();
    });
  });

  describe("SidebarCardsList For You Counter", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (useMediaQuery as jest.Mock).mockImplementation(() => {
        return true;
      });
    });

    const mockBusiness = generateBusiness({
      profileData: generateProfileData({
        operatingPhase: "GUEST_MODE_OWNING",
        municipality: undefined,
        sectorId: undefined,
        existingEmployees: "50",
      }),
    });

    it("render cards with a zero count in the For You header when no Fundings and no certifications are present", () => {
      useMockBusiness(mockBusiness);
      render(
        <SidebarCardsList
          topCards={[]}
          bottomCards={[]}
          fundings={[]}
          hiddenFundings={[]}
          certifications={[]}
          hiddenCertifications={[]}
          displayFundings={true}
          displayCertifications={true}
        />
      );
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(0)");
    });

    it("render cards with a one count in the For You header when one certification is present", () => {
      useMockBusiness(mockBusiness);
      render(
        <SidebarCardsList
          topCards={[]}
          bottomCards={[]}
          fundings={[]}
          hiddenFundings={[]}
          certifications={[generateCertification({})]}
          hiddenCertifications={[]}
          displayFundings={true}
          displayCertifications={true}
        />
      );
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(1)");
    });
  });
});
