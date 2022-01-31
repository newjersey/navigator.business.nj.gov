import { DashboardDefaults } from "@/display-defaults/dashboard/DashboardDefaults";
import { ProfileDefaults } from "@/display-defaults/ProfileDefaults";
import { DashboardDisplayContent, OperateReference, Opportunity } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import DashboardPage from "@/pages/dashboard";
import {
  generateOpportunity,
  generateTaxFiling,
  generateTaxFilingData,
  generateUser,
} from "@/test/factories";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, RenderResult, waitFor, within } from "@testing-library/react";
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
    opportunities?: Opportunity[];
  }): RenderResult => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <DashboardPage
          displayContent={overrides.displayContent ?? emptyDisplayContent}
          operateReferences={overrides.operateRefs ?? emptyOperateRef}
          opportunities={overrides.opportunities ?? []}
        />
      </ThemeProvider>
    );
  };

  it("includes user full name in header", () => {
    useMockUserData({ user: generateUser({ name: "Ada Lovelace" }) });
    const subject = renderPage({});
    const expectedHeaderText = templateEval(DashboardDefaults.headerText, { name: "Ada Lovelace" });
    expect(subject.getByText(expectedHeaderText)).toBeInTheDocument();
  });

  it("greets user when name is undefined", () => {
    useMockUserData({ user: generateUser({ name: undefined }) });
    const subject = renderPage({});
    expect(subject.getByText(DashboardDefaults.missingNameHeaderText)).toBeInTheDocument();
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

  it("displays all opportunities", () => {
    const opportunities = [
      generateOpportunity({ name: "Opportunity 1" }),
      generateOpportunity({ name: "Opportunity 2" }),
      generateOpportunity({ name: "Opportunity 3" }),
    ];

    const subject = renderPage({ opportunities });

    expect(subject.getByText("Opportunity 1")).toBeInTheDocument();
    expect(subject.getByText("Opportunity 2")).toBeInTheDocument();
    expect(subject.getByText("Opportunity 3")).toBeInTheDocument();
  });

  it("displays correct opportunity type tag", () => {
    const opportunities = [
      generateOpportunity({ id: "opp1", type: "FUNDING" }),
      generateOpportunity({ id: "opp2", type: "CERTIFICATION" }),
    ];

    const subject = renderPage({ opportunities });

    const opp1 = within(subject.getByTestId("opp1"));
    const opp2 = within(subject.getByTestId("opp2"));

    expect(opp1.getByText(DashboardDefaults.fundingTagText)).toBeInTheDocument();
    expect(opp2.getByText(DashboardDefaults.certificationTagText)).toBeInTheDocument();
  });

  it("links to task page for opportunities", () => {
    const opportunities = [generateOpportunity({ urlSlug: "opp", name: "Funding Opp" })];

    const subject = renderPage({ opportunities });

    expect(subject.getByText("Funding Opp").getAttribute("href")).toEqual("/opportunities/opp");
  });

  it("displays first 150 characters of opportunity description", () => {
    const opp1Characters = Array(151).fill("a").join("");
    const opp1ExpectedTextOnPage = `${Array(150).fill("a").join("")}...`;

    const opp2Characters = Array(150).fill("b").join("");
    const opp2ExpectedTextOnPage = `${Array(150).fill("b").join("")}`;

    const opportunities = [
      generateOpportunity({ contentMd: opp1Characters }),
      generateOpportunity({ contentMd: opp2Characters }),
    ];
    const subject = renderPage({ opportunities });
    expect(subject.getByText(opp1ExpectedTextOnPage)).toBeInTheDocument();
    expect(subject.getByText(opp2ExpectedTextOnPage)).toBeInTheDocument();
  });

  it("truncates markdown without showing characters on page", () => {
    const characters = Array(145).fill("a").join("");
    const boldContent = `${characters} *a bold text*`;
    const linkContent = `${characters} [a link text](www.example.com)`;

    const opportunities = [
      generateOpportunity({ contentMd: boldContent }),
      generateOpportunity({ contentMd: linkContent }),
    ];
    const subject = renderPage({ opportunities });
    expect(subject.getByText("a bo")).toBeInTheDocument();
    expect(subject.getByText("a li")).toBeInTheDocument();
  });

  it("shows toast alert when success query is true", async () => {
    useMockRouter({ isReady: true, query: { success: "true" } });
    const subject = renderPage({});
    await waitFor(() => expect(subject.getByText(ProfileDefaults.successTextHeader)).toBeInTheDocument());
  });
});
