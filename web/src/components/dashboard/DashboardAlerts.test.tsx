import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { QUERIES } from "@/lib/domain-logic/routes";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness, useMockProfileData } from "@/test/mock/mockUseUserData";
import {
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { findAlert } from "@/test/helpers/accessible-queries";
import { generatePreferences } from "@businessnjgovnavigator/shared/";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { act, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

const Config = getMergedConfig();

describe("<DashboardAlerts />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({ onboardingFormProgress: "COMPLETED" });
    useMockRoadmap({});
    useMockRouter({});
    jest.useFakeTimers();
  });

  const renderStatefulPage = (business?: Business): void => {
    setupStatefulUserDataContext();
    render(
      <WithStatefulUserData
        initialUserData={
          business
            ? generateUserDataForBusiness(business)
            : generateUserDataForBusiness(generateBusiness({}))
        }
      >
        <DashboardAlerts />
      </WithStatefulUserData>,
    );
  };

  it("shows snackbar alert when success query is true", async () => {
    useMockProfileData({});
    useMockRouter({ isReady: true, query: { success: "true" } });
    renderStatefulPage(
      generateBusiness({
        preferences: generatePreferences({ phaseNewlyChanged: true }),
        onboardingFormProgress: "COMPLETED",
      }),
    );
    const alert = await findAlert();
    expect(alert).toHaveTextContent(Config.profileDefaults.default.successTextHeader);
  });

  it("renders calendar snackbar when fromFormBusinessEntity query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromFormBusinessEntity]: "true" } });
    renderStatefulPage();
    expect(await screen.findByTestId("snackbar-alert-calendar")).toBeInTheDocument();
  });

  it("renders task status updated snackbar when fromFormBusinessEntity query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromFormBusinessEntity]: "true" } });
    renderStatefulPage();
    act(() => jest.runAllTimers());
    expect(await screen.findByTestId("checkbox-status-updated-snackbar-alert")).toBeInTheDocument();
  });

  it("renders certifications snackbar when fromForming query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromForming]: "true" } });
    renderStatefulPage();
    expect(await screen.findByTestId("certification-alert")).toBeInTheDocument();
  });

  it("renders deadlines and opportunities snackbar when fromForming query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromForming]: "true" } });
    renderStatefulPage();
    act(() => jest.runAllTimers());
    expect(await screen.findByTestId("deadlines-opportunities-alert")).toBeInTheDocument();
  });

  it("renders funding snackbar when fromFunding query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromFunding]: "true" } });
    renderStatefulPage();
    expect(await screen.findByTestId("funding-alert")).toBeInTheDocument();
  });

  it("renders deferred question snackbar when deferredQuestionAnswered query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.deferredQuestionAnswered]: "true" } });
    renderStatefulPage();
    expect(await screen.findByTestId("deferredQuestionAnswered-alert")).toBeInTheDocument();
  });

  it("renders additional business snackbar when from query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromAdditionalBusiness]: "true" } });
    renderStatefulPage();
    expect(await screen.findByTestId("fromAdditionalBusiness-alert")).toBeInTheDocument();
  });

  it("renders needs account snackbar when fromOnboarding query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromOnboarding]: "true" } });
    renderStatefulPage();
    expect(await screen.findByTestId("needs-account-alert")).toBeInTheDocument();
  });

  it("renders needs delete business snackbar when fromDeleteBusiness query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromDeleteBusiness]: "true" } });
    renderStatefulPage();
    expect(await screen.findByTestId("delete-business-alert")).toBeInTheDocument();
  });
});
