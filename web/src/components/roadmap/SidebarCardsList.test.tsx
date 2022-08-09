import { getMergedConfig } from "@/contexts/configContext";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import {
  generateCertification,
  generateFunding,
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
  generateUserData,
} from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { SidebarCardsList } from "./SidebarCardsList";
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

describe("SidebarCards List", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  const createDisplayContent = (sidebar?: Record<string, SidebarCardContent>) => ({
    contentMd: "",
    sidebarDisplayContent: sidebar ?? {
      welcome: generateSidebarCardContent({}),
    },
  });

  const renderPage = (overrides: {
    sidebarCards?: Record<string, SidebarCardContent>;
    fundings?: Funding[];
    certifications?: Certification[];
  }) => {
    render(
      <SidebarCardsList
        sidebarDisplayContent={createDisplayContent(overrides.sidebarCards).sidebarDisplayContent}
        fundings={overrides.fundings ?? []}
        certifications={overrides.certifications ?? []}
      />
    );
  };

  const renderWithUserData = (
    userData: UserData,
    overrides: {
      sidebarCards?: Record<string, SidebarCardContent>;
      fundings?: Funding[];
      certifications?: Certification[];
    }
  ) => {
    return render(
      <WithStatefulUserData initialUserData={userData}>
        <ThemeProvider theme={createTheme()}>
          <SidebarCardsList
            sidebarDisplayContent={createDisplayContent(overrides.sidebarCards).sidebarDisplayContent}
            fundings={overrides.fundings ?? []}
            certifications={overrides.certifications ?? []}
          />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  describe("nudges", () => {
    it("renders the welcome card", () => {
      const sidebarCards = {
        welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
      };

      useMockUserData({ preferences: generatePreferences({ visibleRoadmapSidebarCards: ["welcome"] }) });

      renderPage({ sidebarCards });
      expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
    });

    it("removes successful registration card when it's closed", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["successful-registration"],
        }),
      });

      const sidebarCards = {
        "successful-registration": generateSidebarCardContent({
          id: "successful-registration",
          contentMd: "SuccessContent",
          hasCloseButton: true,
        }),
      };

      renderWithUserData(userData, {
        sidebarCards,
      });

      await waitFor(() => {
        expect(screen.getByText("SuccessContent")).toBeInTheDocument();
      });

      fireEvent.click(
        within(screen.getByTestId("successful-registration") as HTMLElement).getByLabelText("Close")
      );

      await waitFor(() => {
        expect(screen.queryByText("SuccessContent")).not.toBeInTheDocument();
      });
    });
  });

  describe("certifications", () => {
    it("shows the certification cards if the user is formed and registered", () => {
      useMockUserData(
        generateUserData({
          profileData: generateProfileData({
            operatingPhase: "FORMED_AND_REGISTERED",
            ownershipTypeIds: ["disabled-veteran", "minority-owned"],
          }),
        })
      );

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

    it("doesn't show the certification cards if the user is not formed and registered", () => {
      useMockProfileData({
        operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        ownershipTypeIds: ["disabled-veteran", "minority-owned"],
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
      useMockProfileData({
        operatingPhase: "FORMED_AND_REGISTERED",
        ownershipTypeIds: ["disabled-veteran"],
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

    it("links to task page for certifications", () => {
      useMockProfileData(profileDataForUnfilteredOpportunities);
      const certifications = [generateCertification({ urlSlug: "cert1", name: "Cert 1" })];
      renderPage({ certifications });
      expect(screen.getByText("Cert 1")).toHaveAttribute("href", "/certification/cert1");
    });
  });

  describe("funding opportunities", () => {
    it("displays fundings filtered & sorted from user data when user is UP_AND_RUNNING", () => {
      const initialUserData = generateUserData({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          existingEmployees: "1",
          sectorId: "construction",
          operatingPhase: "UP_AND_RUNNING",
        }),
      });

      const fundings = [
        generateFunding({ name: "Funding 1", sector: ["construction"], status: "closed" }),
        generateFunding({ name: "Funding 2", sector: ["construction"], status: "rolling application" }),
        generateFunding({ name: "Funding 3", sector: ["cannabis"], status: "rolling application" }),
        generateFunding({ name: "Funding 4", sector: [], status: "deadline" }),
        generateFunding({ name: "Funding 5", sector: [], status: "first come, first serve" }),
      ];

      renderWithUserData(initialUserData, { fundings });

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
      const initialUserData = generateUserData({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          existingEmployees: "1",
          sectorId: "construction",
          operatingPhase: "FORMED_AND_REGISTERED",
        }),
      });

      const fundings = [
        generateFunding({ name: "Funding 1", sector: ["construction"], status: "rolling application" }),
      ];

      renderWithUserData(initialUserData, { fundings });

      expect(screen.queryByText("Funding 1")).not.toBeInTheDocument();
    });
  });

  describe("hiding opportunities", () => {
    const certifications = [generateCertification({ urlSlug: "cert1", name: "Cert 1", id: "cert1-id" })];
    const fundings = [generateFunding({ urlSlug: "fund1", name: "Fund 1", id: "fund1-id" })];

    beforeEach(() => {
      setupStatefulUserDataContext();
    });

    it("moves an opportunity to/from Hidden accordion when hide/unhide is clicked", () => {
      renderWithUserData(generateUserData({ profileData: profileDataForUnfilteredOpportunities }), {
        certifications,
        fundings,
      });

      let cert1 = within(screen.getByTestId("cert1-id"));
      const visibleOpportunities = within(screen.getByTestId("visible-opportunities"));
      const hiddenOpportunities = within(screen.getByTestId("hidden-opportunities"));

      expect(visibleOpportunities.getByText("Cert 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();

      fireEvent.click(cert1.getByText(Config.dashboardDefaults.hideOpportunityText));
      cert1 = within(screen.getByTestId("cert1-id"));

      expect(visibleOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();
      expect(hiddenOpportunities.getByText("Cert 1")).toBeInTheDocument();

      fireEvent.click(cert1.getByText(Config.dashboardDefaults.unHideOpportunityText));

      expect(visibleOpportunities.getByText("Cert 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();
    });

    it("hides opportunities from user data", () => {
      const initialUserData = generateUserData({
        profileData: profileDataForUnfilteredOpportunities,
        preferences: generatePreferences({
          hiddenCertificationIds: [],
        }),
      });

      renderWithUserData(initialUserData, { certifications, fundings });
      const visibleOpportunities = within(screen.getByTestId("visible-opportunities"));

      expect(visibleOpportunities.getByText("Cert 1")).toBeInTheDocument();
    });
  });

  const profileDataForUnfilteredOpportunities = generateProfileData({
    operatingPhase: "FORMED_AND_REGISTERED",
    homeBasedBusiness: false,
    municipality: undefined,
    existingEmployees: "1",
    sectorId: undefined,
    ownershipTypeIds: ["veteran-owned", "disabled-veteran", "minority-owned", "woman-owned"],
  });
});
