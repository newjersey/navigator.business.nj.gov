import { SidebarCardFundingNudge } from "@/components/dashboard/SidebarCardFundingNudge";
import { getMergedConfig } from "@/contexts/configContext";
import { SidebarCardContent } from "@/lib/types/types";
import {
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
  generateUserData,
} from "@/test/factories";
import { selectDropdownByValue } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});

const Config = getMergedConfig();

describe("<SidebarCardFundingNudge />", () => {
  let card: SidebarCardContent;

  const renderWithUserData = (userData: Partial<UserData>) => {
    render(
      <WithStatefulUserData initialUserData={generateUserData(userData)}>
        <SidebarCardFundingNudge card={card} />
      </WithStatefulUserData>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();
    card = generateSidebarCardContent({ id: "funding-nudge" });
  });

  describe("when clicking funding button for non-generic industry", () => {
    it("updates operating phase to UP_AND_RUNNING", () => {
      renderWithUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "cannabis",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["funding-nudge"] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));
      expect(currentUserData().profileData.operatingPhase).toEqual("UP_AND_RUNNING");
    });
  });

  describe("when clicking funding button for generic industry", () => {
    it("updates operating phase to UP_AND_RUNNING after modal success", () => {
      renderWithUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["funding-nudge"] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));

      expect(screen.getByText(Config.dashboardDefaults.sectorModalTitle)).toBeInTheDocument();
      selectDropdownByValue("Sector", "clean-energy");
      fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalSaveButton));
      expect(currentUserData().profileData.operatingPhase).toEqual("UP_AND_RUNNING");
    });

    it("does not update operating phase when user cancels from within modal", () => {
      renderWithUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["funding-nudge"] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));

      expect(screen.getByText(Config.dashboardDefaults.sectorModalTitle)).toBeInTheDocument();
      selectDropdownByValue("Sector", "clean-energy");
      fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalCancelButton));
      expect(userDataWasNotUpdated()).toEqual(true);
    });
  });
});
