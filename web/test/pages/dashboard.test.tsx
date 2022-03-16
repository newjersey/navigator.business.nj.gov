import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Certification, DashboardDisplayContent, Funding, OperateReference } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import DashboardPage from "@/pages/dashboard";
import {
  generateCertification,
  generateFunding,
  generatePreferences,
  generateProfileData,
  generateTaxFiling,
  generateTaxFilingData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { UserData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import dayjs from "dayjs";
import React from "react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");

const setMobileScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

describe("dashboard", () => {
  const emptyDisplayContent: DashboardDisplayContent = {
    introTextMd: "",
    opportunityTextMd: "",
  };
  const emptyOperateRef = {};

  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRouter({});
    setMobileScreen(true);
  });

  const renderPage = (overrides: {
    displayContent?: DashboardDisplayContent;
    operateRefs?: Record<string, OperateReference>;
    fundings?: Funding[];
    certifications?: Certification[];
  }): RenderResult => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <DashboardPage
          displayContent={overrides.displayContent ?? emptyDisplayContent}
          operateReferences={overrides.operateRefs ?? emptyOperateRef}
          fundings={overrides.fundings ?? []}
          certifications={overrides.certifications ?? []}
        />
      </ThemeProvider>
    );
  };

  const renderWithUserData = (
    userData: UserData,
    overrides: {
      fundings?: Funding[];
      certifications?: Certification[];
    }
  ) => {
    return render(
      <WithStatefulUserData initialUserData={userData}>
        <ThemeProvider theme={createTheme()}>
          <DashboardPage
            displayContent={emptyDisplayContent}
            operateReferences={emptyOperateRef}
            fundings={overrides.fundings ?? []}
            certifications={overrides.certifications ?? []}
          />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  it("includes user full name in header", () => {
    useMockUserData({ user: generateUser({ name: "Ada Lovelace" }) });
    const subject = renderPage({});
    const expectedHeaderText = templateEval(Config.dashboardDefaults.headerText, { name: "Ada Lovelace" });
    expect(subject.getByText(expectedHeaderText)).toBeInTheDocument();
  });

  it("greets user when name is undefined", () => {
    useMockUserData({ user: generateUser({ name: undefined }) });
    const subject = renderPage({});
    expect(subject.getByText(Config.dashboardDefaults.missingNameHeaderText)).toBeInTheDocument();
  });

  it("displays intro content", () => {
    const content: DashboardDisplayContent = {
      introTextMd: "*some cool text here*",
      opportunityTextMd: "",
    };
    const subject = renderPage({ displayContent: content });
    expect(subject.getByText("some cool text here")).toBeInTheDocument();
  });

  it("displays filings calendar with annual report date", () => {
    const dueDate = dayjs().add(2, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
    });
    useMockUserData({ taxFilingData: generateTaxFilingData({ filings: [annualReport] }) });
    const operateRefs: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    const subject = renderPage({ operateRefs });
    expect(subject.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
    expect(subject.getByText(dueDate.format("M/D"), { exact: false })).toBeInTheDocument();
    expect(subject.getByText("Annual Report")).toBeInTheDocument();
  });

  it("displays filings calendar as list with annual report date", () => {
    setMobileScreen(false);

    const dueDate = dayjs().add(2, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
    });
    useMockUserData({ taxFilingData: generateTaxFilingData({ filings: [annualReport] }) });
    const operateRefs: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    const subject = renderPage({ operateRefs });
    expect(subject.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(subject.getByText(dueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    expect(
      subject.getByText(`Annual Report ${dayjs(annualReport.dueDate, "YYYY-MM-DD").format("YYYY")}`)
    ).toBeInTheDocument();
  });

  it("displays total count of filtered certifications of fundings in list header", () => {
    const initialUserData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: "construction",
        ownershipTypeIds: ["disabled-veteran"],
      }),
    });

    const fundings = [
      generateFunding({ name: "Funding 1", sector: ["construction"], status: "closed" }), // Filtered out
      generateFunding({ name: "Funding 2", sector: ["construction"], status: "open" }),
      generateFunding({ name: "Funding 3", sector: ["cannabis"], status: "open" }), // Filtered out
      generateFunding({ name: "Funding 4", sector: [], status: "deadline" }),
      generateFunding({ name: "Funding 5", sector: [], status: "first-come, first-served" }),
    ];
    const certifications = [
      generateCertification({ name: "Cert 1", applicableOwnershipTypes: ["disabled-veteran"] }),
      generateCertification({ name: "Cert 2", applicableOwnershipTypes: [] }),
      generateCertification({ name: "Cert 3", applicableOwnershipTypes: ["minority-owned"] }), // Filtered out
    ];

    setupStatefulUserDataContext();
    const subject = renderWithUserData(initialUserData, { fundings, certifications });

    const label = templateEval(Config.dashboardDefaults.opportunitiesCount, { count: "5" });
    expect(subject.getByText(label)).toBeInTheDocument();
  });

  it("displays certifications filtered from user data", () => {
    useMockProfileData({
      ownershipTypeIds: ["disabled-veteran"],
    });

    const certifications = [
      generateCertification({ name: "Cert 1", applicableOwnershipTypes: ["disabled-veteran"] }),
      generateCertification({ name: "Cert 2", applicableOwnershipTypes: [] }),
      generateCertification({ name: "Cert 3", applicableOwnershipTypes: ["minority-owned"] }),
    ];

    const subject = renderPage({ certifications });

    expect(subject.getByText("Cert 1")).toBeInTheDocument();
    expect(subject.getByText("Cert 2")).toBeInTheDocument();
    expect(subject.queryByText("Cert 3")).not.toBeInTheDocument();
  });

  it("displays fundings filtered & sorted from user data", () => {
    useMockProfileData({
      homeBasedBusiness: false,
      municipality: undefined,
      existingEmployees: "1",
      sectorId: "construction",
    });

    const fundings = [
      generateFunding({ name: "Funding 1", sector: ["construction"], status: "closed" }),
      generateFunding({ name: "Funding 2", sector: ["construction"], status: "open" }),
      generateFunding({ name: "Funding 3", sector: ["cannabis"], status: "open" }),
      generateFunding({ name: "Funding 4", sector: [], status: "deadline" }),
      generateFunding({ name: "Funding 5", sector: [], status: "first-come, first-served" }),
    ];

    const subject = renderPage({ fundings });

    expect(subject.queryByText("Funding 1")).not.toBeInTheDocument();
    expect(subject.getByText("Funding 2")).toBeInTheDocument();
    expect(subject.queryByText("Funding 3")).not.toBeInTheDocument();
    expect(subject.getByText("Funding 4")).toBeInTheDocument();
    expect(subject.getByText("Funding 5")).toBeInTheDocument();

    const visualFundings = subject.getAllByText(new RegExp(/^Funding [0-9]/));
    expect(visualFundings[0]).toHaveTextContent("Funding 4");
    expect(visualFundings[1]).toHaveTextContent("Funding 5");
    expect(visualFundings[2]).toHaveTextContent("Funding 2");
  });

  it("links to task page for fundings", () => {
    useMockProfileData(profileDataForUnfilteredOpportunities);
    const fundings = [generateFunding({ urlSlug: "opp", name: "Funding Opp", status: "open" })];
    const subject = renderPage({ fundings });
    expect(subject.getByText("Funding Opp").getAttribute("href")).toEqual("/funding/opp");
  });

  it("links to task page for certifications", () => {
    useMockProfileData(profileDataForUnfilteredOpportunities);
    const certifications = [generateCertification({ urlSlug: "cert1", name: "Cert 1" })];
    const subject = renderPage({ certifications });
    expect(subject.getByText("Cert 1").getAttribute("href")).toEqual("/certification/cert1");
  });

  it("displays first 150 characters of funding description", () => {
    useMockProfileData(profileDataForUnfilteredOpportunities);
    const opp1Characters = Array(151).fill("a").join("");
    const opp1ExpectedTextOnPage = `${Array(150).fill("a").join("")}...`;

    const opp2Characters = Array(150).fill("b").join("");
    const opp2ExpectedTextOnPage = `${Array(150).fill("b").join("")}`;

    const fundings = [
      generateFunding({ contentMd: opp1Characters, status: "open" }),
      generateFunding({ contentMd: opp2Characters, status: "open" }),
    ];
    const subject = renderPage({ fundings });
    expect(subject.getByText(opp1ExpectedTextOnPage)).toBeInTheDocument();
    expect(subject.getByText(opp2ExpectedTextOnPage)).toBeInTheDocument();
  });

  it("truncates markdown without showing characters on page", () => {
    useMockProfileData(profileDataForUnfilteredOpportunities);
    const characters = Array(145).fill("a").join("");
    const boldContent = `${characters} *a bold text*`;
    const linkContent = `${characters} [a link text](www.example.com)`;

    const fundings = [
      generateFunding({ contentMd: boldContent, status: "open" }),
      generateFunding({ contentMd: linkContent, status: "open" }),
    ];
    const subject = renderPage({ fundings });
    expect(subject.getByText("a bo")).toBeInTheDocument();
    expect(subject.getByText("a li")).toBeInTheDocument();
  });

  it("shows registration modal when guest user clicks profile edit button", async () => {
    const setModalIsVisible = jest.fn();
    const subject = render(
      withAuthAlert(
        <ThemeProvider theme={createTheme()}>
          <DashboardPage
            displayContent={emptyDisplayContent}
            operateReferences={emptyOperateRef}
            fundings={[]}
            certifications={[]}
          />
        </ThemeProvider>,
        IsAuthenticated.FALSE,
        { modalIsVisible: false, setModalIsVisible }
      )
    );
    fireEvent.click(subject.getByTestId("grey-callout-link"));
    expect(setModalIsVisible).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("directs authenticated user to profile when profile edit button is clicked", async () => {
    const setModalIsVisible = jest.fn();
    const subject = render(
      withAuthAlert(
        <ThemeProvider theme={createTheme()}>
          <DashboardPage
            displayContent={emptyDisplayContent}
            operateReferences={emptyOperateRef}
            fundings={[]}
            certifications={[]}
          />
        </ThemeProvider>,
        IsAuthenticated.TRUE,
        { modalIsVisible: false, setModalIsVisible }
      )
    );
    fireEvent.click(subject.getByTestId("grey-callout-link"));
    expect(mockPush).toHaveBeenCalled();
    expect(setModalIsVisible).not.toHaveBeenCalled();
  });

  it("shows toast alert when success query is true", async () => {
    useMockRouter({ isReady: true, query: { success: "true" } });
    const subject = renderPage({});
    await waitFor(() =>
      expect(subject.getByText(Config.profileDefaults.successTextHeader)).toBeInTheDocument()
    );
  });

  it("can un-graduate users who were previously starting a business", async () => {
    const initialUserData = generateUserData({
      profileData: generateProfileData({
        initialOnboardingFlow: "STARTING",
        hasExistingBusiness: true,
      }),
    });
    setupStatefulUserDataContext();
    const subject = renderWithUserData(initialUserData, {});
    expect(subject.queryByText(Config.dashboardDefaults.backToRoadmapHeader)).toBeInTheDocument();

    fireEvent.click(subject.getByText(Config.dashboardDefaults.backToRoadmapLinkText));
    expect(currentUserData()).toEqual({
      ...initialUserData,
      profileData: {
        ...initialUserData.profileData,
        hasExistingBusiness: false,
      },
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/roadmap"));
  });

  it("does not show un-graduation box for users who have only used the owning-a-business flow", () => {
    useMockProfileData({ initialOnboardingFlow: "OWNING" });
    const subject = renderPage({});
    expect(subject.queryByText(Config.dashboardDefaults.backToRoadmapHeader)).not.toBeInTheDocument();
  });

  describe("hiding opportunities", () => {
    let subject: RenderResult;
    const headerWithCount = (count: number): string =>
      templateEval(Config.dashboardDefaults.hiddenOpportunitiesHeader, { count: `${count}` });
    const certifications = [generateCertification({ urlSlug: "cert1", name: "Cert 1", id: "cert1-id" })];
    const fundings = [generateFunding({ urlSlug: "fund1", name: "Fund 1", id: "fund1-id" })];

    beforeEach(() => {
      setupStatefulUserDataContext();
    });

    it("moves an opportunity to/from Hidden accordion when hide/unhide is clicked", () => {
      subject = renderWithUserData(generateUserData({ profileData: profileDataForUnfilteredOpportunities }), {
        certifications,
        fundings,
      });

      let funding1 = within(subject.getByTestId("fund1-id"));
      let visibleOpportunities = within(subject.getByTestId("visible-opportunities"));
      let hiddenOpportunities = within(subject.getByTestId("hidden-opportunities"));

      expect(subject.queryByText(headerWithCount(0))).toBeInTheDocument();
      expect(subject.queryByText(headerWithCount(1))).not.toBeInTheDocument();

      expect(visibleOpportunities.queryByText("Fund 1")).toBeInTheDocument();
      expect(visibleOpportunities.queryByText("Cert 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Fund 1")).not.toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();

      fireEvent.click(funding1.getByText(Config.dashboardDefaults.hideOpportunityText));
      funding1 = within(subject.getByTestId("fund1-id"));
      visibleOpportunities = within(subject.getByTestId("visible-opportunities"));
      hiddenOpportunities = within(subject.getByTestId("hidden-opportunities"));

      expect(subject.queryByText(headerWithCount(0))).not.toBeInTheDocument();
      expect(subject.queryByText(headerWithCount(1))).toBeInTheDocument();

      expect(visibleOpportunities.queryByText("Fund 1")).not.toBeInTheDocument();
      expect(visibleOpportunities.queryByText("Cert 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Fund 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();

      fireEvent.click(funding1.getByText(Config.dashboardDefaults.unhideOpportunityText));
      visibleOpportunities = within(subject.getByTestId("visible-opportunities"));
      hiddenOpportunities = within(subject.getByTestId("hidden-opportunities"));

      expect(subject.queryByText(headerWithCount(0))).toBeInTheDocument();
      expect(subject.queryByText(headerWithCount(1))).not.toBeInTheDocument();

      expect(visibleOpportunities.queryByText("Fund 1")).toBeInTheDocument();
      expect(visibleOpportunities.queryByText("Cert 1")).toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Fund 1")).not.toBeInTheDocument();
      expect(hiddenOpportunities.queryByText("Cert 1")).not.toBeInTheDocument();
    });

    it("saves hidden opportunities to user data", () => {
      const initialUserData = generateUserData({
        profileData: profileDataForUnfilteredOpportunities,
        preferences: generatePreferences({
          hiddenCertificationIds: [],
          hiddenFundingIds: [],
        }),
      });

      subject = renderWithUserData(initialUserData, { certifications, fundings });
      const funding1 = within(subject.getByTestId("fund1-id"));

      fireEvent.click(funding1.getByText(Config.dashboardDefaults.hideOpportunityText));
      expect(currentUserData()).toEqual({
        ...initialUserData,
        preferences: {
          ...initialUserData.preferences,
          hiddenFundingIds: ["fund1-id"],
        },
      });
    });

    it("hides opportunities from user data", () => {
      const initialUserData = generateUserData({
        profileData: profileDataForUnfilteredOpportunities,
        preferences: generatePreferences({
          hiddenCertificationIds: [],
          hiddenFundingIds: ["fund1-id"],
        }),
      });

      subject = renderWithUserData(initialUserData, { certifications, fundings });
      const visibleOpportunities = within(subject.getByTestId("visible-opportunities"));

      expect(subject.queryByText(headerWithCount(0))).not.toBeInTheDocument();
      expect(subject.queryByText(headerWithCount(1))).toBeInTheDocument();
      expect(visibleOpportunities.queryByText("Fund 1")).not.toBeInTheDocument();
      expect(visibleOpportunities.queryByText("Cert 1")).toBeInTheDocument();
    });

    it("displays empty state when all opportunities are hidden", () => {
      const initialUserData = generateUserData({
        profileData: profileDataForUnfilteredOpportunities,
        preferences: generatePreferences({
          hiddenCertificationIds: ["cert1-id"],
          hiddenFundingIds: ["fund1-id"],
        }),
      });

      subject = renderWithUserData(initialUserData, { certifications, fundings });
      expect(subject.queryByText(Config.dashboardDefaults.emptyOpportunitiesHeader)).toBeInTheDocument();
    });
  });

  const profileDataForUnfilteredOpportunities = generateProfileData({
    homeBasedBusiness: false,
    municipality: undefined,
    existingEmployees: "1",
    sectorId: undefined,
    ownershipTypeIds: ["veteran-owned", "disabled-veteran", "minority-owned", "woman-owned"],
  });
});
