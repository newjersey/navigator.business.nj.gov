import { SidebarCardsContainer } from "@/components/dashboard/SidebarCardsContainer";
import { getMergedConfig } from "@/contexts/configContext";
import { Certification, Funding, RoadmapDisplayContent, SidebarCardContent } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateCertification,
  generateFunding,
  generateSidebarCardContent,
  getProfileDataForUnfilteredOpportunities,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness, useMockProfileData } from "@/test/mock/mockUseUserData";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { Business, generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { generatePreferences, generateProfileData } from "@businessnjgovnavigator/shared/test";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

describe("<SidebarCardsContainer />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  const createDisplayContent = (sidebar?: Record<string, SidebarCardContent>): RoadmapDisplayContent => {
    return {
      sidebarDisplayContent: sidebar ?? {
        welcome: generateSidebarCardContent({}),
      },
    };
  };

  const renderPage = (overrides: {
    sidebarCards?: Record<string, SidebarCardContent>;
    fundings?: Funding[];
    certifications?: Certification[];
  }): void => {
    render(
      <SidebarCardsContainer
        sidebarDisplayContent={createDisplayContent(overrides.sidebarCards).sidebarDisplayContent}
        fundings={overrides.fundings ?? []}
        certifications={overrides.certifications ?? []}
      />
    );
  };

  const renderWithBusiness = (
    business: Business,
    overrides: {
      sidebarCards?: Record<string, SidebarCardContent>;
      fundings?: Funding[];
      certifications?: Certification[];
    }
  ): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <ThemeProvider theme={createTheme()}>
          <SidebarCardsContainer
            sidebarDisplayContent={createDisplayContent(overrides.sidebarCards).sidebarDisplayContent}
            fundings={overrides.fundings ?? []}
            certifications={overrides.certifications ?? []}
          />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  describe("nudges", () => {
    it("renders a sidebar bar card", () => {
      const sidebarCards = {
        "fake-card": generateSidebarCardContent({
          id: "fake-card",
        }),
      };

      useMockBusiness({
        preferences: generatePreferences({ visibleSidebarCards: ["fake-card"] }),
      });

      renderPage({ sidebarCards });
      expect(screen.getByTestId("fake-card")).toBeInTheDocument();
    });

    it("removes successful registration card when it's closed", async () => {
      const business = generateBusiness({
        preferences: generatePreferences({
          visibleSidebarCards: ["fake-visible-card"],
        }),
      });

      const sidebarCards = {
        "fake-visible-card": generateSidebarCardContent({
          id: "fake-visible-card",
          contentMd: "FakeContent",
          hasCloseButton: true,
        }),
      };

      renderWithBusiness(business, { sidebarCards });

      await waitFor(() => {
        expect(screen.getByText("FakeContent")).toBeInTheDocument();
      });

      fireEvent.click(within(screen.getByTestId("fake-visible-card") as HTMLElement).getByLabelText("Close"));

      await waitFor(() => {
        expect(screen.queryByText("FakeContent")).not.toBeInTheDocument();
      });
    });
  });

  describe("certifications", () => {
    it("shows the certification cards if the business is formed", () => {
      useMockBusiness({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.FORMED,
          ownershipTypeIds: ["disabled-veteran", "minority-owned"],
        }),
      });

      const certifications = [
        generateCertification({
          name: "Cert 1",
          applicableOwnershipTypes: ["disabled-veteran", "minority-owned"],
        }),
        generateCertification({
          name: "Cert 2",
          applicableOwnershipTypes: ["disabled-veteran", "minority-owned"],
        }),
      ];

      renderPage({ certifications });

      expect(screen.getByText("Cert 1")).toBeInTheDocument();
      expect(screen.getByText("Cert 2")).toBeInTheDocument();
    });

    it("doesn't show the certification cards if the business is not formed", () => {
      useMockBusiness({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
          ownershipTypeIds: ["disabled-veteran", "minority-owned"],
        }),
      });

      const certifications = [
        generateCertification({
          name: "Cert 1",
          applicableOwnershipTypes: ["disabled-veteran", "minority-owned"],
        }),
        generateCertification({
          name: "Cert 2",
          applicableOwnershipTypes: ["disabled-veteran", "minority-owned"],
        }),
      ];

      renderPage({ certifications });

      expect(screen.queryByText("Cert 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Cert 2")).not.toBeInTheDocument();
    });

    it("displays certifications filtered from user data", () => {
      useMockBusiness({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.FORMED,
          ownershipTypeIds: ["disabled-veteran"],
        }),
      });

      const certifications = [
        generateCertification({ name: "Cert 1", applicableOwnershipTypes: ["disabled-veteran"] }),
        generateCertification({ name: "Cert 2", applicableOwnershipTypes: [] }),
        generateCertification({ name: "Cert 3", applicableOwnershipTypes: ["minority-owned"] }),
      ];

      renderPage({ certifications });

      expect(screen.getByText("Cert 1")).toBeInTheDocument();
      expect(screen.getByText("Cert 2")).toBeInTheDocument();
      expect(screen.queryByText("Cert 3")).not.toBeInTheDocument();
    });

    it("routes to a specific certification page for certifications", () => {
      useMockProfileData(getProfileDataForUnfilteredOpportunities());
      const certifications = [generateCertification({ urlSlug: "cert1", name: "Cert 1" })];
      renderPage({ certifications });
      fireEvent.click(screen.getByText("Cert 1"));
      expect(mockPush).toHaveBeenCalledWith("/certification/cert1");
    });
  });

  describe("funding opportunities", () => {
    it("displays fundings filtered & sorted from user data when user is UP_AND_RUNNING", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          existingEmployees: "1",
          sectorId: "construction",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
        }),
      });

      const fundings = [
        generateFunding({ name: "Funding 1", sector: ["construction"], status: "closed" }),
        generateFunding({ name: "Funding 2", sector: ["construction"], status: "rolling application" }),
        generateFunding({ name: "Funding 3", sector: ["cannabis"], status: "rolling application" }),
        generateFunding({ name: "Funding 4", sector: [], status: "deadline" }),
        generateFunding({ name: "Funding 5", sector: [], status: "first come, first serve" }),
      ];

      renderWithBusiness(business, { fundings });

      expect(screen.queryByText("Funding 1")).not.toBeInTheDocument();
      expect(screen.getByText("Funding 2")).toBeInTheDocument();
      expect(screen.queryByText("Funding 3")).not.toBeInTheDocument();
      expect(screen.getByText("Funding 4")).toBeInTheDocument();
      expect(screen.getByText("Funding 5")).toBeInTheDocument();

      const visualFundings = screen.getAllByText(new RegExp(/^Funding \d/));
      expect(visualFundings[0]).toHaveTextContent("Funding 4");
      expect(visualFundings[1]).toHaveTextContent("Funding 5");
      expect(visualFundings[2]).toHaveTextContent("Funding 2");
    });

    it("does not display fundings for non 'up and running' operating phase", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          existingEmployees: "1",
          sectorId: "construction",
          operatingPhase: OperatingPhaseId.FORMED,
        }),
      });

      const fundings = [
        generateFunding({ name: "Funding 1", sector: ["construction"], status: "rolling application" }),
      ];

      renderWithBusiness(business, { fundings });

      expect(screen.queryByText("Funding 1")).not.toBeInTheDocument();
    });

    it("links to task page for fundings", () => {
      useMockProfileData(getProfileDataForUnfilteredOpportunities());
      const fundings = [
        generateFunding({ urlSlug: "opp", name: "Funding Opp", status: "rolling application" }),
      ];
      renderPage({ fundings });
      fireEvent.click(screen.getByText("Funding Opp"));
      expect(mockPush).toHaveBeenCalledWith("/funding/opp");
    });

    it("displays link to learn more about fundings when user is UP_AND_RUNNING", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
        }),
      });
      renderWithBusiness(business, { fundings: [] });
      expect(
        screen.getByText(Config.dashboardDefaults.learnMoreFundingOpportunitiesText)
      ).toBeInTheDocument();
    });

    it("does not display link to learn more about fundings when user is not UP_AND_RUNNING", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.FORMED,
        }),
      });
      renderWithBusiness(business, { fundings: [] });
      expect(
        screen.queryByText(Config.dashboardDefaults.learnMoreFundingOpportunitiesText)
      ).not.toBeInTheDocument();
    });
  });

  describe("hiding opportunities", () => {
    const certifications = [generateCertification({ urlSlug: "cert1", name: "Cert 1", id: "cert1-id" })];
    const fundings = [generateFunding({ urlSlug: "fund1", name: "Fund 1", id: "fund1-id" })];

    beforeEach(() => {
      setupStatefulUserDataContext();
    });

    it("moves an opportunity to/from Hidden accordion when hide/unhide is clicked", () => {
      renderWithBusiness(generateBusiness({ profileData: getProfileDataForUnfilteredOpportunities() }), {
        certifications,
        fundings,
      });

      let cert1 = within(screen.getByTestId("cert1-id"));
      const visibleOpportunities = within(screen.getByTestId("visible-opportunities"));
      const hiddenOpportunities = within(screen.getByTestId("hidden-opportunities"));

      expect(visibleOpportunities.getByText("Fund 1")).toBeInTheDocument();
      expect(visibleOpportunities.getByText("Cert 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Fund 1")).not.toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();

      fireEvent.click(cert1.getByText(Config.dashboardDefaults.hideOpportunityText));
      cert1 = within(screen.getByTestId("cert1-id"));

      expect(visibleOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();
      expect(visibleOpportunities.getByText("Fund 1")).toBeInTheDocument();
      expect(hiddenOpportunities.getByText("Cert 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Fund 1")).not.toBeInTheDocument();

      fireEvent.click(cert1.getByText(Config.dashboardDefaults.unHideOpportunityText));

      expect(visibleOpportunities.getByText("Cert 1")).toBeInTheDocument();
      expect(visibleOpportunities.getByText("Fund 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Fund 1")).not.toBeInTheDocument();
    });

    it("saves hidden opportunities to user data", () => {
      const business = generateBusiness({
        profileData: getProfileDataForUnfilteredOpportunities(),
        preferences: generatePreferences({
          hiddenCertificationIds: [],
          hiddenFundingIds: [],
        }),
      });

      renderWithBusiness(business, { certifications, fundings });
      const funding1 = within(screen.getByTestId("fund1-id"));

      fireEvent.click(funding1.getByText(Config.dashboardDefaults.hideOpportunityText));
      expect(currentBusiness().preferences.hiddenFundingIds).toEqual(["fund1-id"]);
    });

    it("hides opportunities from user data", () => {
      const business = generateBusiness({
        profileData: getProfileDataForUnfilteredOpportunities(),
        preferences: generatePreferences({
          hiddenCertificationIds: [],
          hiddenFundingIds: ["fund1-id"],
        }),
      });

      renderWithBusiness(business, { certifications, fundings });
      const visibleOpportunities = within(screen.getByTestId("visible-opportunities"));

      expect(visibleOpportunities.queryByText("Fund 1")).not.toBeInTheDocument();
      expect(visibleOpportunities.getByText("Cert 1")).toBeInTheDocument();
    });

    it("only counts hidden certifications before fundings are unlocked", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.FORMED,
        }),
        preferences: generatePreferences({
          hiddenCertificationIds: ["cert1-id"],
          hiddenFundingIds: ["fund1-id"],
        }),
      });

      renderWithBusiness(business, { certifications, fundings });
      expect(
        screen.getByText(templateEval(Config.dashboardDefaults.hiddenOpportunitiesHeader, { count: "1" }))
      ).toBeInTheDocument();
    });

    it("counts both hidden fundings and certifications after fundings are unlocked", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
        }),
        preferences: generatePreferences({
          hiddenCertificationIds: ["cert1-id"],
          hiddenFundingIds: ["fund1-id"],
        }),
      });

      renderWithBusiness(business, { certifications, fundings });
      expect(
        screen.getByText(templateEval(Config.dashboardDefaults.hiddenOpportunitiesHeader, { count: "2" }))
      ).toBeInTheDocument();
    });
  });
});
