import { Certification, DashboardDisplayContent, Funding, OperateReference } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import DashboardPage from "@/pages/dashboard";
import {
  generateCertification,
  generateFunding,
  generateTaxFiling,
  generateTaxFilingData,
  generateUser,
} from "@/test/factories";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, RenderResult, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import React from "react";
import { useMockRouter } from "../mock/mockRouter";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");

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

  it("includes user full name in header", () => {
    useMockUserData({ user: generateUser({ name: "Ada Lovelace" }) });
    const subject = renderPage({});
    const expectedHeaderText = templateEval(Defaults.dashboardDefaults.headerText, { name: "Ada Lovelace" });
    expect(subject.getByText(expectedHeaderText)).toBeInTheDocument();
  });

  it("greets user when name is undefined", () => {
    useMockUserData({ user: generateUser({ name: undefined }) });
    const subject = renderPage({});
    expect(subject.getByText(Defaults.dashboardDefaults.missingNameHeaderText)).toBeInTheDocument();
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
    expect(subject.getByText(dueDate.format("M/D"), { exact: false })).toBeInTheDocument();
    expect(subject.getByText("Annual Report")).toBeInTheDocument();
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
    useMockProfileDataForUnfilteredOpportunities();
    const fundings = [generateFunding({ urlSlug: "opp", name: "Funding Opp", status: "open" })];

    const subject = renderPage({ fundings });

    expect(subject.getByText("Funding Opp").getAttribute("href")).toEqual("/funding/opp");
  });

  it("links to task page for certifications", () => {
    useMockProfileDataForUnfilteredOpportunities();
    const certifications = [generateCertification({ urlSlug: "cert1", name: "Cert 1" })];

    const subject = renderPage({ certifications });

    expect(subject.getByText("Cert 1").getAttribute("href")).toEqual("/certification/cert1");
  });

  it("displays first 150 characters of funding description", () => {
    useMockProfileDataForUnfilteredOpportunities();
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
    useMockProfileDataForUnfilteredOpportunities();
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

  it("shows toast alert when success query is true", async () => {
    useMockRouter({ isReady: true, query: { success: "true" } });
    const subject = renderPage({});
    await waitFor(() =>
      expect(subject.getByText(Defaults.profileDefaults.successTextHeader)).toBeInTheDocument()
    );
  });

  it("shows back-to-roadmap box for users who were previously starting a business", () => {
    useMockProfileData({ initialOnboardingFlow: "STARTING" });
    const subject = renderPage({});
    expect(subject.queryByText(Defaults.dashboardDefaults.backToRoadmapHeader)).toBeInTheDocument();
  });

  it("does not show back-to-roadmap box for users who have only used the owning-a-business flow", () => {
    useMockProfileData({ initialOnboardingFlow: "OWNING" });
    const subject = renderPage({});
    expect(subject.queryByText(Defaults.dashboardDefaults.backToRoadmapHeader)).not.toBeInTheDocument();
  });

  const useMockProfileDataForUnfilteredOpportunities = () => {
    useMockProfileData({
      homeBasedBusiness: false,
      municipality: undefined,
      existingEmployees: "1",
      sectorId: undefined,
      ownershipTypeIds: ["veteran-owned", "disabled-veteran", "minority-owned", "woman-owned"],
    });
  };
});
