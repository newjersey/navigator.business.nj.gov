import * as api from "@/lib/api-client/apiClient";
import * as useUserModule from "@/lib/data-hooks/useUserData";
import { UpdateQueue } from "@/lib/UpdateQueue";
import { useMockIntersectionObserver } from "@/test/mock/MockIntersectionObserver";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { clickSave, generateBusinessForProfile } from "@/test/pages/profile/profile-helpers";
import { Business, generateUserDataForBusiness, UserData } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { generateOwningProfileData } from "@businessnjgovnavigator/shared/";
import Profile from "@/pages/profile";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";

const Config = getMergedConfig();
const mockApi = api as jest.Mocked<typeof api>;
const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postGetAnnualFilings: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const createMockUpdateQueue = (
  updateFn: jest.Mock,
  userData: UserData,
  business: Business,
): UpdateQueue => {
  const mockQueue: Record<string, jest.Mock> = {};
  const chainableMethods = [
    "queue",
    "queueBusiness",
    "queueSwitchBusiness",
    "queueTaskProgress",
    "queueUser",
    "queueProfileData",
    "queuePreferences",
    "queueTaxFilingData",
    "queueFormationData",
    "queueFormationFormData",
    "queueTaskItemChecklist",
    "queueEnvironmentData",
    "queueXrayRegistrationData",
    "queueRoadmapTaskData",
  ];
  for (const method of chainableMethods) {
    mockQueue[method] = jest.fn().mockReturnValue(mockQueue);
  }
  mockQueue.update = updateFn;
  mockQueue.current = jest.fn().mockReturnValue(userData);
  mockQueue.currentBusiness = jest.fn().mockReturnValue(business);
  return mockQueue as unknown as UpdateQueue;
};

const renderProfileOnContactTab = (business: Business, mockUpdate: jest.Mock): void => {
  const userData = generateUserDataForBusiness(business);
  const mockUpdateQueue = createMockUpdateQueue(mockUpdate, userData, business);

  mockUseUserData.mockReturnValue({
    userData,
    business,
    isLoading: false,
    error: undefined,
    hasCompletedFetch: true,
    updateQueue: mockUpdateQueue,
    createUpdateQueue: jest.fn(),
    refresh: jest.fn(),
    clearUserDataError: jest.fn(),
  });

  render(
    withNeedsAccountContext(
      <ThemeProvider theme={createTheme()}>
        <Profile municipalities={[]} CMS_ONLY_tab="contact" />
      </ThemeProvider>,
      IsAuthenticated.TRUE,
      {
        showNeedsAccountModal: false,
        setShowNeedsAccountModal: jest.fn(),
        showContinueWithoutSaving: false,
        setShowContinueWithoutSaving: jest.fn(),
        userWantsToContinueWithoutSaving: false,
        setUserWantsToContinueWithoutSaving: jest.fn(),
      },
    ),
  );
};

describe("profile - govDelivery error handling", () => {
  let business: Business;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    useMockRoadmap({});
    useMockDocuments({});
    useMockIntersectionObserver();
    mockApi.postGetAnnualFilings.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    business = generateBusinessForProfile({
      profileData: generateOwningProfileData({}),
    });
  });

  it("shows subscribe error alert when updateQueue.update() rejects with SUBSCRIBE_FAILED", async () => {
    const mockUpdate = jest
      .fn()
      .mockRejectedValueOnce({ data: { govDeliveryError: "SUBSCRIBE_FAILED" } });

    renderProfileOnContactTab(business, mockUpdate);

    await act(async () => {
      clickSave();
    });

    await waitFor(() => {
      expect(
        screen.getByText(Config.profileDefaults.default.newsletterSubscribeError),
      ).toBeInTheDocument();
    });
  });

  it("shows unsubscribe error alert when updateQueue.update() rejects with UNSUBSCRIBE_FAILED", async () => {
    const mockUpdate = jest
      .fn()
      .mockRejectedValueOnce({ data: { govDeliveryError: "UNSUBSCRIBE_FAILED" } });

    renderProfileOnContactTab(business, mockUpdate);

    await act(async () => {
      clickSave();
    });

    await waitFor(() => {
      expect(
        screen.getByText(Config.profileDefaults.default.newsletterUnsubscribeError),
      ).toBeInTheDocument();
    });
  });

  it("shows email update error alert when updateQueue.update() rejects with EMAIL_UPDATE_FAILED", async () => {
    const mockUpdate = jest
      .fn()
      .mockRejectedValueOnce({ data: { govDeliveryError: "EMAIL_UPDATE_FAILED" } });

    renderProfileOnContactTab(business, mockUpdate);

    await act(async () => {
      clickSave();
    });

    await waitFor(() => {
      expect(
        screen.getByText(Config.profileDefaults.default.newsletterEmailUpdateError),
      ).toBeInTheDocument();
    });
  });

  it("clears govDeliveryError at start of a new save", async () => {
    const mockUpdate = jest.fn();
    mockUpdate.mockRejectedValueOnce({ data: { govDeliveryError: "SUBSCRIBE_FAILED" } });
    mockUpdate.mockResolvedValueOnce(undefined);

    renderProfileOnContactTab(business, mockUpdate);

    // First save: triggers failure
    await act(async () => {
      clickSave();
    });
    await waitFor(() => {
      expect(
        screen.getByText(Config.profileDefaults.default.newsletterSubscribeError),
      ).toBeInTheDocument();
    });

    // Second save: error should clear immediately at start
    await act(async () => {
      clickSave();
    });
    await waitFor(() => {
      expect(
        screen.queryByText(Config.profileDefaults.default.newsletterSubscribeError),
      ).not.toBeInTheDocument();
    });
  });

  it("clears govDeliveryError on successful save", async () => {
    const mockUpdate = jest.fn();
    mockUpdate.mockRejectedValueOnce({ data: { govDeliveryError: "UNSUBSCRIBE_FAILED" } });
    mockUpdate.mockResolvedValueOnce(undefined);

    renderProfileOnContactTab(business, mockUpdate);

    // First save: triggers failure
    await act(async () => {
      clickSave();
    });
    await waitFor(() => {
      expect(
        screen.getByText(Config.profileDefaults.default.newsletterUnsubscribeError),
      ).toBeInTheDocument();
    });

    // Second save: succeeds, error should clear
    await act(async () => {
      clickSave();
    });
    await waitFor(() => {
      expect(
        screen.queryByText(Config.profileDefaults.default.newsletterUnsubscribeError),
      ).not.toBeInTheDocument();
    });
  });

  it("calls clearUserDataError when govDelivery error occurs", async () => {
    const mockUpdate = jest
      .fn()
      .mockRejectedValueOnce({ data: { govDeliveryError: "SUBSCRIBE_FAILED" } });

    const userData = generateUserDataForBusiness(business);
    const mockUpdateQueue = createMockUpdateQueue(mockUpdate, userData, business);
    const mockClearUserDataError = jest.fn();

    mockUseUserData.mockReturnValue({
      userData,
      business,
      isLoading: false,
      error: undefined,
      hasCompletedFetch: true,
      updateQueue: mockUpdateQueue,
      createUpdateQueue: jest.fn(),
      refresh: jest.fn(),
      clearUserDataError: mockClearUserDataError,
    });

    render(
      withNeedsAccountContext(
        <ThemeProvider theme={createTheme()}>
          <Profile municipalities={[]} CMS_ONLY_tab="contact" />
        </ThemeProvider>,
        IsAuthenticated.TRUE,
        {
          showNeedsAccountModal: false,
          setShowNeedsAccountModal: jest.fn(),
          showContinueWithoutSaving: false,
          setShowContinueWithoutSaving: jest.fn(),
          userWantsToContinueWithoutSaving: false,
          setUserWantsToContinueWithoutSaving: jest.fn(),
        },
      ),
    );

    await act(async () => {
      clickSave();
    });

    await waitFor(() => {
      expect(mockClearUserDataError).toHaveBeenCalled();
    });
  });
});
