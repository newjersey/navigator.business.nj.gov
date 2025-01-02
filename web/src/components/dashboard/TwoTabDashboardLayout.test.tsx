import TwoTabDashboardLayout from "@/components/dashboard/TwoTabDashboardLayout";
import { getMergedConfig } from "@/contexts/configContext";
import { Certification, Funding } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateCertification,
  generateFunding,
  getProfileDataForUnfilteredOpportunities,
} from "@/test/factories";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import { OperatingPhases } from "@businessnjgovnavigator/shared/operatingPhase";
import { generatePreferences } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

const Config = getMergedConfig();

describe("<TwoTabDashboardLayout />", () => {
  beforeEach(() => {
    useMockBusiness({});
  });

  const renderPage = ({
    certificationsArray,
    fundingsArray,
  }: {
    certificationsArray?: Certification[];
    fundingsArray?: Funding[];
  }): void => {
    render(
      <TwoTabDashboardLayout
        aboveTabs={<div>Above Tabs Content</div>}
        firstTab={<div>First Tab Content</div>}
        secondTab={<div>Second Tab Content</div>}
        certifications={certificationsArray ?? certs}
        fundings={fundingsArray ?? fundings}
      />
    );
  };

  it("only renders the content in the first tab", () => {
    renderPage({});

    expect(screen.getByText("First Tab Content")).toBeInTheDocument();
    expect(screen.queryByText("Second Tab Content")).not.toBeInTheDocument();
  });

  it("renders the content in the second tab when second tab button is clicked", () => {
    renderPage({});

    fireEvent.click(
      screen.getByText(
        templateEval(Config.dashboardDefaults.mobileSecondTabText, {
          count: "0",
        })
      )
    );

    expect(screen.getByText("Second Tab Content")).toBeInTheDocument();
    expect(screen.queryByText("First Tab Content")).not.toBeInTheDocument();
  });

  describe("displays the correct count of cards within second tab", () => {
    it("only counts the nudge cards", () => {
      const operatingPhases = OperatingPhases.filter((phase) => {
        return !phase.displayFundings && !phase.displayCertifications;
      });

      useMockBusiness({
        preferences: generatePreferences({ visibleSidebarCards: [SIDEBAR_CARDS.notRegistered] }),
        profileData: {
          ...getProfileDataForUnfilteredOpportunities(),
          operatingPhase: randomElementFromArray(operatingPhases).id,
        },
      });

      renderPage({});

      expect(
        screen.getByText(
          templateEval(Config.dashboardDefaults.mobileSecondTabText, {
            count: "1",
          })
        )
      ).toBeInTheDocument();
    });

    it("only counts the nudge and certification cards", () => {
      const operatingPhases = OperatingPhases.filter((phase) => {
        return !phase.displayFundings && phase.displayCertifications;
      });

      useMockBusiness({
        preferences: generatePreferences({ visibleSidebarCards: [SIDEBAR_CARDS.notRegistered] }),
        profileData: {
          ...getProfileDataForUnfilteredOpportunities(),
          operatingPhase: randomElementFromArray(operatingPhases).id,
          ownershipTypeIds: ["disabled-veteran", "minority-owned"],
        },
      });

      renderPage({});

      expect(
        screen.getByText(
          templateEval(Config.dashboardDefaults.mobileSecondTabText, {
            count: "4",
          })
        )
      ).toBeInTheDocument();
    });

    it("counts the nudge, certification, and funding cards", () => {
      const operatingPhases = OperatingPhases.filter((phase) => {
        return phase.displayFundings && phase.displayCertifications;
      });

      useMockBusiness({
        preferences: generatePreferences({ visibleSidebarCards: [SIDEBAR_CARDS.notRegistered] }),
        profileData: {
          ...getProfileDataForUnfilteredOpportunities(),

          operatingPhase: randomElementFromArray(operatingPhases).id,
          ownershipTypeIds: ["disabled-veteran", "minority-owned"],
        },
      });

      renderPage({});

      expect(
        screen.getByText(
          templateEval(Config.dashboardDefaults.mobileSecondTabText, {
            count: "6",
          })
        )
      ).toBeInTheDocument();
    });
  });
});

const certs = [
  generateCertification({
    name: "Cert 1",
    applicableOwnershipTypes: ["veteran-owned"],
  }),
  generateCertification({
    name: "Cert 2",
    applicableOwnershipTypes: ["disabled-veteran"],
  }),
  generateCertification({
    name: "Cert 3",
    applicableOwnershipTypes: ["minority-owned"],
  }),
  generateCertification({
    name: "Cert 4",
    applicableOwnershipTypes: ["woman-owned"],
  }),
  generateCertification({ name: "Cert 5", applicableOwnershipTypes: [] }),
];

const fundings = [
  generateFunding({
    name: "Funding 4",
    sector: [],
    status: "deadline",
    certifications: ["minority-owned"],
  }),
  generateFunding({
    name: "Funding 5",
    sector: [],
    status: "first come, first serve",
    certifications: ["disabled-veteran"],
  }),
];
