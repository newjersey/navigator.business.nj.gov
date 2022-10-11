import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { getMergedConfig } from "@/contexts/configContext";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import * as analyticsHelpers from "@/lib/utils/analytics-helpers";
import { generateProfileData, generateRoadmap, generateUserData } from "@/test/factories";
import { withRoadmap } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/utils/analytics-helpers", () => ({ setAnalyticsDimensions: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const mockAnalyticsHelpers = analyticsHelpers as jest.Mocked<typeof analyticsHelpers>;
const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;

const Config = getMergedConfig();

describe("<DeferredOnboardingQuestion />", () => {
  let setRoadmap: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    setRoadmap = jest.fn();
    mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(generateRoadmap({}));
    useMockRouter({});
  });

  const renderComponent = (userData?: UserData) => {
    render(
      withRoadmap(
        <WithStatefulUserData initialUserData={userData || generateUserData({})}>
          <DeferredOnboardingQuestion>
            <OnboardingHomeBasedBusiness />
          </DeferredOnboardingQuestion>
        </WithStatefulUserData>,
        generateRoadmap({}),
        undefined,
        setRoadmap
      )
    );
  };

  it("saves changes to profile data", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("home-based-business-radio-true"));
    fireEvent.click(screen.getByText(Config.dashboardDefaults.deferredOnboardingSaveButtonText));
    expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
  });

  it("sets analytics dimensions", async () => {
    const profileData = generateProfileData({ homeBasedBusiness: undefined });
    renderComponent(generateUserData({ profileData }));
    fireEvent.click(screen.getByTestId("home-based-business-radio-true"));
    fireEvent.click(screen.getByText(Config.dashboardDefaults.deferredOnboardingSaveButtonText));
    await waitFor(() =>
      expect(mockAnalyticsHelpers.setAnalyticsDimensions).toHaveBeenCalledWith({
        ...profileData,
        homeBasedBusiness: true,
      })
    );
  });

  it("builds and sets new roadmap", async () => {
    const profileData = generateProfileData({ homeBasedBusiness: undefined });
    renderComponent(generateUserData({ profileData }));
    fireEvent.click(screen.getByTestId("home-based-business-radio-true"));
    fireEvent.click(screen.getByText(Config.dashboardDefaults.deferredOnboardingSaveButtonText));

    const returnedRoadmap = generateRoadmap({});
    mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(returnedRoadmap);
    await waitFor(() =>
      expect(mockBuildUserRoadmap.buildUserRoadmap).toHaveBeenCalledWith({
        ...profileData,
        homeBasedBusiness: true,
      })
    );
    expect(setRoadmap).toHaveBeenCalledWith(returnedRoadmap);
  });

  it("shallow routes to dashboard with query parameter", async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("home-based-business-radio-true"));
    fireEvent.click(screen.getByText(Config.dashboardDefaults.deferredOnboardingSaveButtonText));
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({ query: { deferredQuestionAnswered: "true" } }, undefined, {
        shallow: true,
      })
    );
  });

  it("does not update if no answer provided", () => {
    renderComponent();
    fireEvent.click(screen.getByText(Config.dashboardDefaults.deferredOnboardingSaveButtonText));
    expect(userDataWasNotUpdated()).toBe(true);
    expect(mockAnalyticsHelpers.setAnalyticsDimensions).not.toHaveBeenCalled();
    expect(mockBuildUserRoadmap.buildUserRoadmap).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
