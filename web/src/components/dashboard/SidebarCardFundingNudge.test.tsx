import { SidebarCardFundingNudge } from "@/components/dashboard/SidebarCardFundingNudge";
import { getMergedConfig } from "@/contexts/configContext";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { generateSidebarCardContent } from "@/test/factories";
import { selectDropdownByValue } from "@/test/helpers/helpers-testing-library-selectors";
import { useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import {
  generateBusiness,
  generatePreferences,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      show_me_funding_opportunities: {
        click: {
          show_me_funding_opportunities: jest.fn(),
        },
      },
    },
  };
}

const Config = getMergedConfig();

describe("<SidebarCardFundingNudge />", () => {
  let card: SidebarCardContent;
  const { fundingNudge } = SIDEBAR_CARDS;

  const renderWithBusiness = (business: Partial<Business>): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(generateBusiness(business))}>
        <SidebarCardFundingNudge card={card} />
      </WithStatefulUserData>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();
    card = generateSidebarCardContent({ id: fundingNudge });
  });

  describe("when clicking funding button for non-generic industry", () => {
    it("updates operating phase to UP_AND_RUNNING and marks tax registration task complete", () => {
      renderWithBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "cannabis",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));
      expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.UP_AND_RUNNING);
    });
  });

  describe("when clicking funding button for generic industry", () => {
    it("updates with new sector, marks tax registration task complete, and operating phase to UP_AND_RUNNING after modal success", () => {
      renderWithBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));

      expect(screen.getByText(Config.dashboardDefaults.sectorModalTitle)).toBeInTheDocument();
      selectDropdownByValue("Sector", "clean-energy");
      fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalSaveButton));
      expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.UP_AND_RUNNING);
      expect(currentBusiness().profileData.sectorId).toEqual("clean-energy");
    });

    it("does not update operating phase when user cancels from within modal", () => {
      renderWithBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));

      expect(screen.getByText(Config.dashboardDefaults.sectorModalTitle)).toBeInTheDocument();
      selectDropdownByValue("Sector", "clean-energy");
      fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalCancelButton));
      expect(userDataWasNotUpdated()).toEqual(true);
    });
  });

  it("fires show_me_funding_opportunities analytics event when link is clicked", () => {
    renderWithBusiness({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        industryId: "acupuncture",
      }),
      preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
    });
    fireEvent.click(screen.getByTestId("cta-funding-nudge"));
    expect(
      mockAnalytics.event.show_me_funding_opportunities.click.show_me_funding_opportunities
    ).toHaveBeenCalledTimes(1);
  });
});
