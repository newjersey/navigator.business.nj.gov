import { SidebarCardsList, SidebarCardsListProps } from "@/components/dashboard/SidebarCardsList";
import { getMergedConfig } from "@/contexts/configContext";
import { getForYouCardCount } from "@/lib/domain-logic/sidebarCardsHelpers";
import analytics from "@/lib/utils/analytics";
import * as helpers from "@/lib/utils/helpers";
import { removeMarkdownFormatting } from "@/lib/utils/helpers";
import { generateCertification, generateFunding, generateSidebarCardContent } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { OperatingPhaseId, OperatingPhases } from "@businessnjgovnavigator/shared/";
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

const getOnlyDisplayCertificationOperatingPhase = (): OperatingPhaseId => {
  const phase = OperatingPhases.find((op): boolean => {
    return !op.displayFundings && op.displayCertifications;
  });
  if (!phase)
    throw new Error(
      "Can't find operating phase with Display Certification as true and Display Funding as false"
    );
  return phase.id;
};

const getDisplayCertificationAndFundingOperatingPhase = (): OperatingPhaseId => {
  const phase = OperatingPhases.find((op): boolean => {
    return op.displayFundings && op.displayCertifications;
  });
  if (!phase)
    throw new Error("Can't find operating phase with Display Certification and Display Funding as true");
  return phase.id;
};

const getDisplayCertificationOperatingPhase = (): OperatingPhaseId => {
  const phase = OperatingPhases.find((op): boolean => {
    return op.displayCertifications;
  });
  if (!phase) throw new Error("Can't find operating phase with Display Certification as true");
  return phase.id;
};

const getDisplayFundingOperatingPhase = (): OperatingPhaseId => {
  const phase = OperatingPhases.find((op): boolean => {
    return op.displayFundings;
  });
  if (!phase) throw new Error("Can't find operating phase with Display Funding as true");
  return phase.id;
};

const getDontDisplayCertificationAndFundingOperatingPhase = (): OperatingPhaseId => {
  const phase = OperatingPhases.find((op): boolean => {
    return !op.displayFundings && op.displayCertifications;
  });
  if (!phase)
    throw new Error("Can't find operating phase with Display Certification and Display Funding as false");
  return phase.id;
};

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
      sideBarCards: [],
      fundings: [generateFunding({})],
      hiddenFundings: [generateFunding({})],
      certifications: [generateCertification({})],
      hiddenCertifications: [generateCertification({})],
      cardCount: 0,
      ...overrides,
    };

    render(<SidebarCardsList {...sidebarCardsListProps} />);
  };

  it("fires unhide_cards analytics when accordion is opened when displayFundings is true", () => {
    useMockBusiness({
      profileData: {
        ...generateProfileData({
          operatingPhase: getDisplayFundingOperatingPhase(),
        }),
      },
    });

    renderComponent({ displayFundingCards: true });
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_cards).toHaveBeenCalledTimes(1);
  });

  it("fires unhide_cards analytics when accordion is opened when displayCertifications is true", () => {
    useMockBusiness({
      profileData: {
        ...generateProfileData({
          operatingPhase: getDisplayCertificationOperatingPhase(),
        }),
      },
    });
    renderComponent({ displayCertificationsCards: true });
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

          renderComponent({ isRemoteSellerWorker: true });
          expect(
            screen.getAllByText(Config.dashboardDefaults.emptyOpportunitiesRemoteSellerWorkerText)[0]
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

          renderComponent({ isRemoteSellerWorker: true });
          expect(
            screen.getAllByText(Config.dashboardDefaults.emptyOpportunitiesRemoteSellerWorkerText)[0]
          ).toBeInTheDocument();
        }
      );
    });

    describe("Empty Opportunities Message", () => {
      it("displays when there are no visible fundings or certifications", () => {
        useMockBusiness({
          profileData: {
            ...generateProfileData({
              operatingPhase: getDisplayCertificationAndFundingOperatingPhase(),
            }),
          },
        });

        renderComponent({
          fundings: [],
          certifications: [],
          displayCertificationsCards: true,
          displayFundingCards: true,
        });

        const emptyMessage = screen.getByTestId("empty-for-you-message");
        const sanitizedString = removeMarkdownFormatting(Config.dashboardDefaults.emptyOpportunitiesHeader);
        const combinedMessage = `${sanitizedString}${Config.dashboardDefaults.emptyOpportunitiesText}`;
        expect(emptyMessage).toHaveTextContent(combinedMessage);
      });

      it("does not display when displayCertifications is true and displayFundings is false", () => {
        useMockBusiness({
          profileData: {
            ...generateProfileData({
              operatingPhase: getOnlyDisplayCertificationOperatingPhase(),
            }),
          },
        });

        renderComponent({
          fundings: [],
          certifications: [],
          displayCertificationsCards: true,
        });

        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });
    });

    describe("Complete Required Tasks Message", () => {
      it("displays when there are no sideBar cards and display Fundings and Certifications are false", () => {
        useMockBusiness({
          profileData: {
            ...generateProfileData({
              operatingPhase: getDontDisplayCertificationAndFundingOperatingPhase(),
            }),
          },
        });

        renderComponent({});
        const emptyMessage = screen.getByTestId("empty-for-you-message");
        const sanitizedString = removeMarkdownFormatting(Config.dashboardDefaults.completeRequiredTasksText);
        expect(emptyMessage).toHaveTextContent(sanitizedString);
      });

      it("does not display when displayFundings is true", () => {
        useMockBusiness({
          profileData: {
            ...generateProfileData({
              operatingPhase: getDisplayFundingOperatingPhase(),
            }),
          },
        });
        renderComponent({ displayFundingCards: true });
        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });

      it("does not display when displayCertifications is true", () => {
        useMockBusiness({
          profileData: {
            ...generateProfileData({
              operatingPhase: getDisplayCertificationOperatingPhase(),
            }),
          },
        });
        renderComponent({ displayCertificationsCards: true });
        expect(screen.queryByTestId("empty-for-you-message")).not.toBeInTheDocument();
      });

      it("does not display when there are side bar cards", () => {
        const sideBarCards = [
          generateSidebarCardContent({
            id: "some-fake-top-card",
          }),
        ];
        renderComponent({ sideBarCards });
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
        operatingPhase: getDisplayCertificationAndFundingOperatingPhase(),
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
        cardCount: getForYouCardCount(mockBusiness, [genericCertification], []),
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
        cardCount: getForYouCardCount(mockBusiness, [], [genericFunding]),
      });
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(1)");
    });

    it("render cards with a two count in the For You header when one funding and one certification are present", () => {
      useMockBusiness(mockBusiness);

      const genericFunding = generateFunding({
        isNonprofitOnly: false,
        county: [],
        sector: [],
        employeesRequired: undefined,
      });
      const genericCertification = generateCertification({
        applicableOwnershipTypes: [],
        isSbe: false,
      });
      renderComponent({
        fundings: [genericFunding],
        certifications: [genericCertification],
        cardCount: getForYouCardCount(mockBusiness, [genericCertification], [genericFunding]),
      });
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(2)");
    });
  });

  describe("View Hidden Items Accordion", () => {
    it("calls scrollToTopOfElement when the accordion opens", async () => {
      useMockBusiness({
        profileData: {
          ...generateProfileData({
            operatingPhase: getDisplayFundingOperatingPhase(),
          }),
        },
      });

      renderComponent({ displayCertificationsCards: true });
      fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
      expect(mockHelpers.scrollToTopOfElement).toHaveBeenCalledTimes(1);
    });

    it("does not call scrollToTopOfElement when the accordion closes", async () => {
      useMockBusiness({
        profileData: {
          ...generateProfileData({
            operatingPhase: getDisplayCertificationOperatingPhase(),
          }),
        },
      });

      renderComponent({ displayCertificationsCards: true });
      fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
      fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
      expect(mockHelpers.scrollToTopOfElement).toHaveBeenCalledTimes(1);
    });
  });
});
