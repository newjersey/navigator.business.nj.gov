import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import { randomPublicFilingLegalStructure, randomTradeNameLegalStructure } from "@/test/factories";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness, useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import {
  generateUser,
  generateUserData,
  getCurrentDateInNewJersey,
  randomInt,
} from "@businessnjgovnavigator/shared/";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();
const baseUserData = generateUserData({});

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<Header />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
    useMockRouter({});
  });

  const renderHeader = (): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <DashboardHeader />
      </ThemeProvider>
    );
  };

  const renderHeaderWithAuth = ({ isAuthenticated }: { isAuthenticated: IsAuthenticated }): void => {
    render(
      withAuth(
        <ThemeProvider theme={createTheme()}>
          <DashboardHeader />
        </ThemeProvider>,
        {
          isAuthenticated: isAuthenticated,
        }
      )
    );
  };

  describe("heading", () => {
    describe("when in STARTING guest mode", () => {
      it("displays industry name with starter kit text", () => {
        useMockProfileData({ industryId: "e-commerce", businessPersona: "STARTING" });
        renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
        const expectedHeaderText = templateEval(Config.dashboardHeaderDefaults.starterKitText, {
          industry: LookupIndustryById("e-commerce").name,
        });
        expect(screen.getByText(expectedHeaderText)).toBeInTheDocument();
        expect(
          screen.queryByText(Config.dashboardHeaderDefaults.genericStarterKitText)
        ).not.toBeInTheDocument();
      });

      it("displays generic starter kit text when industry is generic", () => {
        useMockProfileData({ industryId: "generic", businessPersona: "STARTING" });
        renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
        expect(screen.getByText(Config.dashboardHeaderDefaults.genericStarterKitText)).toBeInTheDocument();

        const templatedHeaderText = templateEval(Config.dashboardHeaderDefaults.starterKitText, {
          industry: LookupIndustryById("generic").name,
        });
        expect(screen.queryByText(templatedHeaderText)).not.toBeInTheDocument();
      });
    });

    describe("when in guest mode - other phases", () => {
      const personas: BusinessPersona[] = ["OWNING", "FOREIGN"];

      it.each(personas)("displays greeting text", (persona) => {
        const business = generateBusiness(baseUserData, {
          profileData: generateProfileData({ industryId: "generic", businessPersona: persona }),
        });
        const userData = generateUserDataForBusiness(business, { user: generateUser({ name: undefined }) });
        useMockUserData(userData);
        renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
        const templatedHeaderText = templateEval(Config.dashboardHeaderDefaults.starterKitText, {
          industry: LookupIndustryById("generic").name,
        });
        expect(
          screen.queryByText(Config.dashboardHeaderDefaults.genericStarterKitText)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(templatedHeaderText)).not.toBeInTheDocument();
        expect(screen.getByText(Config.dashboardHeaderDefaults.noUserNameHeaderText)).toBeInTheDocument();
      });
    });

    describe("when not in guest mode", () => {
      it("greets user when name is undefined", () => {
        useMockUserData({ user: generateUser({ name: undefined }) });
        renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
        expect(screen.getByText(Config.dashboardHeaderDefaults.noUserNameHeaderText)).toBeInTheDocument();
      });

      it("includes user full name in header", () => {
        useMockUserData({ user: generateUser({ name: "Ada Lovelace" }) });
        renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
        const expectedHeaderText = templateEval(Config.dashboardHeaderDefaults.defaultHeaderText, {
          name: "Ada Lovelace",
        });
        expect(screen.getByText(expectedHeaderText)).toBeInTheDocument();
      });
    });
  });

  describe("date", () => {
    it("shows date based on New Jersey Local time", () => {
      const date = getCurrentDateInNewJersey().format("MMMM DD, YYYY");
      useMockProfileData({});
      renderHeader();

      expect(screen.getByText(date)).toBeInTheDocument();
    });
  });

  describe("go to profile link", () => {
    it("displays guest mode content when user is not authenticated and routes to profile page on button click", () => {
      useMockProfileData({
        businessName: "Business Name",
        legalStructureId: randomPublicFilingLegalStructure(),
      });
      renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
      fireEvent.click(screen.getByText(Config.dashboardHeaderDefaults.guestModeToProfileButtonText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
    });

    it("displays generic content when business name is not an empty string and user is authenticated then routes to profile page on button click", () => {
      useMockProfileData({ businessName: "", legalStructureId: randomPublicFilingLegalStructure() });
      renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
      fireEvent.click(screen.getByText(Config.dashboardHeaderDefaults.genericToProfileButtonText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
    });

    it("displays generic content when trade name is undefined and user is authenticated then routes to profile page on button click", () => {
      useMockProfileData({ tradeName: undefined, legalStructureId: randomTradeNameLegalStructure() });
      renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
      fireEvent.click(screen.getByText(Config.dashboardHeaderDefaults.genericToProfileButtonText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
    });

    it("displays generic content when business name is undefined and user is authenticated then routes to profile page on button click", () => {
      useMockProfileData({ businessName: undefined, legalStructureId: randomPublicFilingLegalStructure() });
      renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
      fireEvent.click(screen.getByText(Config.dashboardHeaderDefaults.genericToProfileButtonText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
    });

    it("displays business name when legal structure is public filing", () => {
      const businessName = `Test Company ${randomInt(6)}`;
      useMockProfileData({
        businessName: businessName,
        tradeName: "tradeName",
        legalStructureId: randomPublicFilingLegalStructure(),
      });
      renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
      expect(screen.getByText(businessName)).toBeInTheDocument();
    });

    it("displays trade name when legal structure is trade name", () => {
      const tradeName = `Test Company ${randomInt(6)}`;
      useMockProfileData({
        businessName: "businessName",
        tradeName: tradeName,
        legalStructureId: randomTradeNameLegalStructure(),
      });
      renderHeaderWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
      expect(screen.getByText(tradeName)).toBeInTheDocument();
    });
  });
});
