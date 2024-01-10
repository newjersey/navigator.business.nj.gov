import { SidebarCardsList, SidebarCardsListProps } from "@/components/dashboard/SidebarCardsList";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import * as helpers from "@/lib/utils/helpers";
import { removeMarkdownFormatting } from "@/lib/utils/helpers";
import { generateCertification, generateFunding, generateSidebarCardContent } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { ForeignBusinessTypeId } from "@businessnjgovnavigator/shared/profileData";
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
jest.mock("@/lib/utils/helpers", () => {
  return {
    ...jest.requireActual("@/lib/utils/helpers"),
    scrollToTopOfElement: jest.fn(),
  };
});
const mockHelpers = helpers as jest.Mocked<typeof helpers>;

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

  it("fires unhide_cards analytics when accordion is opened when displayFundings is true", () => {
    renderComponent({ displayFundings: true });
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_cards).toHaveBeenCalledTimes(1);
  });

  it("fires unhide_cards analytics when accordion is opened when displayCertifications is true", () => {
    renderComponent({ displayCertifications: true });
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_cards).toHaveBeenCalledTimes(1);
  });

  describe("Empty State Messages", () => {
    describe("Remote Seller/Worker Message", () => {
      const foreignBusinessTypeIds: ForeignBusinessTypeId[] = [
        "employeesInNJ",
        "revenueInNJ",
        "transactionsInNJ",
      ];

      it.each(foreignBusinessTypeIds)(
        "displays when the business is a Remote Seller/Worker",
        (foreignBusinessTypeId) => {
          const mockBusiness = generateBusiness({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
              operatingPhase: "REMOTE_SELLER_WORKER",
              foreignBusinessTypeIds: [foreignBusinessTypeId],
            }),
          });
          useMockBusiness(mockBusiness);

          renderComponent({});
          expect(
            screen.getByText(Config.dashboardDefaults.emptyOpportunitiesRemoteSellerWorkerText)
          ).toBeInTheDocument();
        }
      );

      it.each(foreignBusinessTypeIds)(
        "displays when the business is a Remote Seller/Worker and operating phase is GUEST_MODE",
        (foreignBusinessTypeId) => {
          const mockBusiness = generateBusiness({
            profileData: generateProfileData({
              operatingPhase: "GUEST_MODE",
              businessPersona: "FOREIGN",
              foreignBusinessTypeIds: [foreignBusinessTypeId],
            }),
          });
          useMockBusiness(mockBusiness);

          renderComponent({});
          expect(
            screen.getByText(Config.dashboardDefaults.emptyOpportunitiesRemoteSellerWorkerText)
          ).toBeInTheDocument();
        }
      );
    });

    describe("Empty Opportunities Message", () => {
      it("displays when there are no visible fundings or certifications", () => {
        renderComponent({
          fundings: [],
          certifications: [],
          displayCertifications: true,
          displayFundings: true,
        });

        const emptyMessage = screen.getByTestId("empty-for-you-message");
        const sanitizedString = removeMarkdownFormatting(Config.dashboardDefaults.emptyOpportunitiesHeader);
        const combinedMessage = `${sanitizedString}${Config.dashboardDefaults.emptyOpportunitiesText}`;
        expect(emptyMessage).toHaveTextContent(combinedMessage);
      });

      it("does not display when displayCertifications is true and displayFundings is false", () => {
        renderComponent({
          fundings: [],
          certifications: [],
          displayCertifications: true,
          displayFundings: false,
        });

        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });

      it("does not display when displayCertifications is false and displayFundings is true", () => {
        renderComponent({
          fundings: [],
          certifications: [],
          displayCertifications: false,
          displayFundings: true,
        });

        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });
    });

    describe("Complete Required Tasks Message", () => {
      it("displays when there are no top or bottom cards and display Fundings and Certifications are false", () => {
        renderComponent({});
        const emptyMessage = screen.getByTestId("empty-for-you-message");
        const sanitizedString = removeMarkdownFormatting(Config.dashboardDefaults.completeRequiredTasksText);
        expect(emptyMessage).toHaveTextContent(sanitizedString);
      });

      it("does not display when displayFundings is true", () => {
        renderComponent({ displayFundings: true });
        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });

      it("does not display when displayCertifications is true", () => {
        renderComponent({ displayCertifications: true });
        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });

      it("does not display when there are top cards", () => {
        const topCards = [
          generateSidebarCardContent({
            id: "some-fake-top-card",
            section: "above-opportunities",
          }),
        ];
        renderComponent({ topCards });
        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });

      it("does not display when there are bottom cards", () => {
        const bottomCards = [
          generateSidebarCardContent({
            id: "some-fake-bottom-card",
            section: "below-opportunities",
          }),
        ];
        renderComponent({ bottomCards });
        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });
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
        homeBasedBusiness: false,
      }),
    });

    it("render cards with a zero count in the For You header when no Fundings and no certifications are present", () => {
      useMockBusiness(mockBusiness);
      renderComponent({
        fundings: [],
        certifications: [],
        displayFundings: true,
        displayCertifications: true,
      });
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(0)");
    });

    it("render cards with a one count in the For You header when one certification is present", () => {
      useMockBusiness(mockBusiness);
      const genericCertification = generateCertification({
        applicableOwnershipTypes: [],
        isSbe: false,
      });
      renderComponent({
        fundings: [],
        certifications: [genericCertification],
        displayFundings: true,
        displayCertifications: true,
      });
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(1)");
    });

    it("render cards with a one count in the For You header when one funding is present", () => {
      useMockBusiness(mockBusiness);
      const genericFunding = generateFunding({
        isNonprofitOnly: false,
        county: [],
        sector: [],
        employeesRequired: undefined,
      });

      renderComponent({
        certifications: [],
        fundings: [genericFunding],
        displayFundings: true,
        displayCertifications: true,
      });
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(1)");
    });

    it("render cards with a two count in the For You header when one funding and one certification are present", () => {
      useMockBusiness(mockBusiness);
      renderComponent({
        displayFundings: true,
        displayCertifications: true,
      });
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(2)");
    });
  });

  describe("View Hidden Items Accordion", () => {
    it("calls scrollToTopOfElement when the accordion opens", async () => {
      renderComponent({ displayFundings: true });
      fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
      expect(mockHelpers.scrollToTopOfElement).toHaveBeenCalledTimes(1);
    });

    it("does not call scrollToTopOfElement when the accordion closes", async () => {
      renderComponent({ displayCertifications: true });
      fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
      fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
      expect(mockHelpers.scrollToTopOfElement).toHaveBeenCalledTimes(1);
    });
  });
});
