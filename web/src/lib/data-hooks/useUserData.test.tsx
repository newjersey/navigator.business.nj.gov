import { AuthContext } from "@/contexts/authContext";
import { IntercomContext, IntercomContextType } from "@/contexts/intercomContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import * as api from "@/lib/api-client/apiClient";
import { AuthState, IsAuthenticated } from "@/lib/auth/AuthContext";
import { UserDataProvider } from "@/lib/data-hooks/UserDataProvider";
import { useUserData, UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import { BrowserStorage } from "@/lib/storage/BrowserStorage";
import { UserDataStorage, UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { UpdateQueue } from "@/lib/UpdateQueue";
import * as analyticsHelpers from "@/lib/utils/analytics-helpers";
import { generateRoadmap } from "@/test/factories";
import {
  generateBusiness,
  generateProfileData,
  generateUser,
  generateUserData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { UserDataError } from "@businessnjgovnavigator/shared/types";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { Dispatch, PropsWithChildren, SetStateAction, useCallback, useState } from "react";
import { SWRConfig } from "swr";

jest.mock("@/lib/utils/analytics-helpers", () => ({ setAnalyticsDimensions: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  getUserData: jest.fn(),
  postUserData: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;
const mockAnalyticsHelpers = analyticsHelpers as jest.Mocked<typeof analyticsHelpers>;

interface DeferredPromise<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (reason: unknown) => void;
}

const deferredPromise = <T,>(): DeferredPromise<T> => {
  let resolvePromise: (value: T) => void = () => {};
  let rejectPromise: (reason: unknown) => void = () => {};
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, resolve: resolvePromise, reject: rejectPromise };
};

interface UserDataHookOptions {
  readonly authState: AuthState;
  readonly storage?: UserDataStorage;
  readonly multipleConsumers?: boolean;
}

interface UserDataHookHarness {
  readonly result: { readonly current: UseUserDataResponse };
  readonly storage: UserDataStorage;
  readonly setAuthState: (authState: AuthState) => Promise<void>;
  readonly setUserDataErrorCalls: jest.Mock<void, [UserDataError | undefined]>;
  readonly setRoadmap: jest.Mock;
  readonly intercom: jest.Mocked<IntercomContextType>;
}

const createTestStorage = (): UserDataStorage => {
  const values = new Map<string, string>();
  const browserStorage: BrowserStorage = {
    get: (key) => values.get(key),
    set: (key, value) => {
      values.set(key, value);
      return true;
    },
    keys: () => [...values.keys()],
    delete: (key) => {
      values.delete(key);
    },
    clear: () => {
      values.clear();
    },
  };
  return UserDataStorageFactory({ browserStorage });
};

const useDuplicateUserDataConsumers = (): UseUserDataResponse => {
  const firstConsumer = useUserData();
  useUserData();
  return firstConsumer;
};

const UserDataConsumer = (): null => {
  useUserData();
  return null;
};

const renderUserDataHook = ({
  authState: initialAuthState,
  storage = createTestStorage(),
  multipleConsumers = false,
}: UserDataHookOptions): UserDataHookHarness => {
  const cache = new Map<unknown, unknown>();
  const setUserDataErrorCalls = jest.fn<void, [UserDataError | undefined]>();
  const setRoadmap = jest.fn();
  const intercom: jest.Mocked<IntercomContextType> = {
    setOperatingPhaseId: jest.fn(),
    setLegalStructureId: jest.fn(),
    setIndustryId: jest.fn(),
    setBusinessPersona: jest.fn(),
  };
  let setAuthState: Dispatch<SetStateAction<AuthState>> = () => {
    throw new Error("Auth provider has not rendered");
  };

  const Wrapper = ({ children }: PropsWithChildren): JSX.Element => {
    const [authState, setAuthStateInProvider] = useState(initialAuthState);
    const [updateQueue, setUpdateQueue] = useState<UpdateQueue | undefined>();
    const [userDataError, setUserDataError] = useState<UserDataError | undefined>();
    setAuthState = setAuthStateInProvider;

    const setTrackedUserDataError = useCallback((error: UserDataError | undefined): void => {
      setUserDataErrorCalls(error);
      setUserDataError(error);
    }, []);

    return (
      <SWRConfig
        value={{
          provider: () => cache,
          dedupingInterval: 0,
          shouldRetryOnError: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        }}
      >
        <AuthContext.Provider value={{ state: authState, dispatch: jest.fn() }}>
          <UpdateQueueContext.Provider value={{ updateQueue, setUpdateQueue }}>
            <UserDataErrorContext.Provider
              value={{
                userDataError,
                setUserDataError: setTrackedUserDataError,
              }}
            >
              <RoadmapContext.Provider
                value={{
                  roadmap: generateRoadmap({}),
                  setRoadmap,
                }}
              >
                <IntercomContext.Provider value={intercom}>
                  <UserDataProvider userDataStorage={storage}>{children}</UserDataProvider>
                </IntercomContext.Provider>
              </RoadmapContext.Provider>
            </UserDataErrorContext.Provider>
          </UpdateQueueContext.Provider>
        </AuthContext.Provider>
      </SWRConfig>
    );
  };

  const utils = renderHook(multipleConsumers ? useDuplicateUserDataConsumers : useUserData, {
    wrapper: Wrapper,
  });

  return {
    ...utils,
    storage,
    setAuthState: async (authState: AuthState): Promise<void> => {
      await act(() => {
        setAuthState(authState);
      });
    },
    setUserDataErrorCalls,
    setRoadmap,
    intercom,
  };
};

const authenticatedState = (userId: string): AuthState => ({
  activeUser: { id: userId, email: "user@example.com" },
  isAuthenticated: IsAuthenticated.TRUE,
});

const guestState = (userId: string): AuthState => ({
  activeUser: { id: userId, email: "guest@example.com" },
  isAuthenticated: IsAuthenticated.FALSE,
});

describe("useUserData", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(generateRoadmap({}));
  });

  it("fails clearly when a rendered consumer is outside UserDataProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<UserDataConsumer />)).toThrow(
      "useUserData must be used within a UserDataProvider",
    );

    consoleError.mockRestore();
  });

  it("does not fetch without an active user", () => {
    renderUserDataHook({
      authState: {
        activeUser: undefined,
        isAuthenticated: IsAuthenticated.FALSE,
      },
    });

    expect(mockApi.getUserData).not.toHaveBeenCalled();
  });

  it("does not fetch while authentication is unresolved", () => {
    const user = generateUser({});
    renderUserDataHook({
      authState: {
        activeUser: user,
        isAuthenticated: IsAuthenticated.UNKNOWN,
      },
    });

    expect(mockApi.getUserData).not.toHaveBeenCalled();
  });

  it("creates and exposes local data without an active auth user", async () => {
    const user = generateUser({});
    const userData = generateUserData({ user });
    const utils = renderUserDataHook({
      authState: {
        activeUser: undefined,
        isAuthenticated: IsAuthenticated.UNKNOWN,
      },
    });

    await act(async () => {
      await utils.result.current.createUpdateQueue(userData);
    });

    expect(utils.result.current.userData).toEqual(userData);
    expect(utils.result.current.updateQueue?.current()).toEqual(userData);
    expect(utils.result.current.isLoading).toBe(false);
    expect(utils.result.current.hasCompletedFetch).toBe(true);
    expect(utils.storage.get(user.id)).toEqual(userData);
    expect(mockApi.getUserData).not.toHaveBeenCalled();
    expect(mockApi.postUserData).not.toHaveBeenCalled();
  });

  it("rejects a local queue for a different owner", async () => {
    const firstUserData = generateUserData({ user: generateUser({ id: "first-user" }) });
    const secondUserData = generateUserData({ user: generateUser({ id: "second-user" }) });
    const utils = renderUserDataHook({
      authState: {
        activeUser: undefined,
        isAuthenticated: IsAuthenticated.UNKNOWN,
      },
    });

    await act(async () => {
      await utils.result.current.createUpdateQueue(firstUserData);
    });

    await expect(utils.result.current.createUpdateQueue(secondUserData)).rejects.toThrow(
      "Cannot create an update queue for a different user",
    );
    expect(utils.result.current.userData).toEqual(firstUserData);
  });

  it("clears local data when an authenticated owner becomes active", async () => {
    const localUserData = generateUserData({ user: generateUser({ id: "local-user" }) });
    const authenticatedUser = generateUser({ id: "authenticated-user" });
    const authenticatedUserData = generateUserData({ user: authenticatedUser });
    const request = deferredPromise<UserData>();
    mockApi.getUserData.mockReturnValue(request.promise);
    const utils = renderUserDataHook({
      authState: {
        activeUser: undefined,
        isAuthenticated: IsAuthenticated.UNKNOWN,
      },
    });
    await act(async () => {
      await utils.result.current.createUpdateQueue(localUserData);
    });

    await utils.setAuthState(authenticatedState(authenticatedUser.id));

    expect(utils.result.current.userData).toBeUndefined();
    expect(utils.result.current.updateQueue).toBeUndefined();

    request.resolve(authenticatedUserData);
    await act(async () => {
      await request.promise;
    });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(authenticatedUserData);
    });
  });

  it("clears authenticated data on logout without adopting a local owner", async () => {
    const user = generateUser({});
    const userData = generateUserData({ user });
    mockApi.getUserData.mockResolvedValue(userData);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(userData);
    });

    await utils.setAuthState({
      activeUser: undefined,
      isAuthenticated: IsAuthenticated.FALSE,
    });

    expect(utils.result.current.userData).toBeUndefined();
    expect(utils.result.current.updateQueue).toBeUndefined();
    expect(utils.result.current.hasCompletedFetch).toBe(false);
  });

  it("starts fetching when authentication resolves", async () => {
    const request = deferredPromise<UserData>();
    const user = generateUser({});
    const userData = generateUserData({ user });
    mockApi.getUserData.mockReturnValue(request.promise);
    const utils = renderUserDataHook({
      authState: {
        activeUser: undefined,
        isAuthenticated: IsAuthenticated.UNKNOWN,
      },
    });

    await utils.setAuthState(authenticatedState(user.id));
    await waitFor(() => {
      expect(mockApi.getUserData).toHaveBeenCalledWith(user.id);
    });
    request.resolve(userData);
    await act(async () => {
      await request.promise;
    });

    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(userData);
    });
  });

  it("loads and persists authenticated user data", async () => {
    const user = generateUser({});
    const userData = generateUserData({ user });
    mockApi.getUserData.mockResolvedValue(userData);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });

    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(userData);
    });

    expect(mockApi.getUserData).toHaveBeenCalledTimes(1);
    expect(mockApi.getUserData).toHaveBeenCalledWith(user.id);
    expect(utils.result.current.hasCompletedFetch).toBe(true);
    expect(utils.storage.get(user.id)).toEqual(userData);
  });

  it("shows persisted authenticated data while revalidating", async () => {
    const request = deferredPromise<UserData>();
    const user = generateUser({});
    const persistedUserData = generateUserData({ user });
    const refreshedUserData = {
      ...persistedUserData,
      lastUpdatedISO: "2026-07-16T12:00:00.000Z",
    };
    const storage = createTestStorage();
    storage.set(user.id, persistedUserData);
    mockApi.getUserData.mockReturnValue(request.promise);

    const utils = renderUserDataHook({
      authState: authenticatedState(user.id),
      storage,
    });

    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(persistedUserData);
    });
    await waitFor(() => {
      expect(mockApi.getUserData).toHaveBeenCalledWith(user.id);
    });

    request.resolve(refreshedUserData);
    await act(async () => {
      await request.promise;
    });
    await waitFor(() => {
      expect(storage.get(user.id)).toEqual(refreshedUserData);
    });
  });

  it("maps an uncached fetch failure to NO_DATA", async () => {
    const user = generateUser({});
    mockApi.getUserData.mockRejectedValue(500);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });

    await waitFor(() => {
      expect(utils.result.current.error).toBe("NO_DATA");
    });

    expect(utils.result.current.userData).toBeUndefined();
    expect(utils.result.current.hasCompletedFetch).toBe(true);
  });

  it("maps a fetch failure with persisted data to CACHED_ONLY", async () => {
    const user = generateUser({});
    const userData = generateUserData({ user });
    const storage = createTestStorage();
    storage.set(user.id, userData);
    mockApi.getUserData.mockRejectedValue(500);
    const utils = renderUserDataHook({
      authState: authenticatedState(user.id),
      storage,
    });

    await waitFor(() => {
      expect(utils.result.current.error).toBe("CACHED_ONLY");
    });

    expect(utils.result.current.userData).toEqual(userData);
  });

  it("hydrates guest data without calling the authenticated endpoint", async () => {
    const user = generateUser({});
    const userData = generateUserData({ user });
    const storage = createTestStorage();
    storage.set(user.id, userData);
    const utils = renderUserDataHook({
      authState: guestState(user.id),
      storage,
    });

    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(userData);
    });

    expect(mockApi.getUserData).not.toHaveBeenCalled();
  });

  it("completes guest initialization without calling the authenticated endpoint", () => {
    const user = generateUser({});
    const utils = renderUserDataHook({ authState: guestState(user.id) });

    expect(utils.result.current.hasCompletedFetch).toBe(true);
    expect(mockApi.getUserData).not.toHaveBeenCalled();
  });

  it("creates and persists initial guest data through the existing consumer API", async () => {
    const user = generateUser({});
    const userData = generateUserData({ user });
    const utils = renderUserDataHook({ authState: guestState(user.id) });

    await act(async () => {
      await utils.result.current.createUpdateQueue(userData);
    });

    expect(utils.result.current.userData).toEqual(userData);
    expect(utils.storage.get(user.id)).toEqual(userData);
    expect(mockApi.getUserData).not.toHaveBeenCalled();
    expect(mockApi.postUserData).not.toHaveBeenCalled();
  });

  it("persists guest updates without posting them", async () => {
    const user = generateUser({});
    const userData = generateUserData({ user });
    const storage = createTestStorage();
    storage.set(user.id, userData);
    const utils = renderUserDataHook({
      authState: guestState(user.id),
      storage,
    });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });

    await act(async () => {
      await utils.result.current.updateQueue
        ?.queueProfileData({ businessName: "Guest business" })
        .update();
    });

    expect(mockApi.postUserData).not.toHaveBeenCalled();
    expect(
      storage.get(user.id)?.businesses[userData.currentBusinessId].profileData.businessName,
    ).toBe("Guest business");
  });

  it("does not post an authenticated update marked as local", async () => {
    const user = generateUser({});
    const userData = generateUserData({ user });
    mockApi.getUserData.mockResolvedValue(userData);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });

    await act(async () => {
      await utils.result.current.updateQueue?.queue(userData).update({ local: true });
    });

    expect(mockApi.postUserData).not.toHaveBeenCalled();
  });

  it("posts authenticated updates and applies the canonical response", async () => {
    const user = generateUser({});
    const initialUserData = generateUserData({ user });
    const response = deferredPromise<UserData>();
    mockApi.getUserData.mockResolvedValue(initialUserData);
    mockApi.postUserData.mockReturnValue(response.promise);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });

    let updatePromise: Promise<void> = Promise.resolve();
    await act(async () => {
      updatePromise =
        utils.result.current.updateQueue
          ?.queueProfileData({ businessName: "Optimistic business" })
          .update() ?? Promise.resolve();
      await Promise.resolve();
    });
    expect(utils.result.current.business?.profileData.businessName).toBe("Optimistic business");

    const canonicalUserData = {
      ...initialUserData,
      businesses: {
        ...initialUserData.businesses,
        [initialUserData.currentBusinessId]: {
          ...initialUserData.businesses[initialUserData.currentBusinessId],
          profileData: generateProfileData({ businessName: "Canonical business" }),
        },
      },
    };
    response.resolve(canonicalUserData);
    await act(async () => {
      await updatePromise;
    });

    expect(mockApi.postUserData).toHaveBeenCalledWith(
      expect.objectContaining({
        businesses: expect.objectContaining({
          [initialUserData.currentBusinessId]: expect.objectContaining({
            profileData: expect.objectContaining({ businessName: "Optimistic business" }),
          }),
        }),
      }),
    );
    expect(utils.result.current.business?.profileData.businessName).toBe("Canonical business");
    expect(utils.storage.get(user.id)).toEqual(canonicalUserData);
  });

  it("retains optimistic data, reports UPDATE_FAILED, and rethrows save errors", async () => {
    const user = generateUser({});
    const initialUserData = generateUserData({ user });
    const saveError = { status: 502, data: { error: "unavailable" } };
    mockApi.getUserData.mockResolvedValue(initialUserData);
    mockApi.postUserData.mockRejectedValue(saveError);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });

    let caughtError: unknown;
    await act(async () => {
      try {
        await utils.result.current.updateQueue
          ?.queueProfileData({ businessName: "Unsaved business" })
          .update();
      } catch (error) {
        caughtError = error;
      }
    });

    expect(caughtError).toBe(saveError);
    expect(utils.result.current.error).toBe("UPDATE_FAILED");
    expect(utils.result.current.business?.profileData.businessName).toBe("Unsaved business");
    expect(
      utils.storage.get(user.id)?.businesses[initialUserData.currentBusinessId].profileData,
    ).toEqual(expect.objectContaining({ businessName: "Unsaved business" }));
  });

  it("rebuilds profile-derived state exactly once for one update", async () => {
    const user = generateUser({});
    const initialUserData = generateUserData({ user });
    mockApi.getUserData.mockResolvedValue(initialUserData);
    mockApi.postUserData.mockImplementation(async (userData) => userData);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });
    mockBuildUserRoadmap.buildUserRoadmap.mockClear();
    mockAnalyticsHelpers.setAnalyticsDimensions.mockClear();
    utils.setRoadmap.mockClear();

    await act(async () => {
      await utils.result.current.updateQueue
        ?.queueProfileData({ businessName: "Changed business" })
        .update();
    });

    expect(mockBuildUserRoadmap.buildUserRoadmap).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsHelpers.setAnalyticsDimensions).toHaveBeenCalledTimes(1);
    expect(utils.setRoadmap).toHaveBeenCalledTimes(1);
  });

  it("accepts a successful save when profile-derived state synchronization fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const user = generateUser({});
    const initialUserData = generateUserData({ user });
    const canonicalUserData = {
      ...initialUserData,
      businesses: {
        ...initialUserData.businesses,
        [initialUserData.currentBusinessId]: {
          ...initialUserData.businesses[initialUserData.currentBusinessId],
          profileData: generateProfileData({ businessName: "Canonical business" }),
        },
      },
    };
    mockApi.getUserData.mockResolvedValue(initialUserData);
    mockApi.postUserData.mockResolvedValue(canonicalUserData);
    mockBuildUserRoadmap.buildUserRoadmap.mockRejectedValue(new Error("Roadmap unavailable"));
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });

    await act(async () => {
      await utils.result.current.updateQueue
        ?.queueProfileData({ businessName: "Optimistic business" })
        .update();
    });

    expect(utils.result.current.userData).toEqual(canonicalUserData);
    expect(utils.storage.get(user.id)).toEqual(canonicalUserData);
    expect(utils.result.current.error).toBeUndefined();
    expect(utils.setUserDataErrorCalls).not.toHaveBeenLastCalledWith("UPDATE_FAILED");
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to synchronize profile-derived state after user data save",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });

  it("refreshes the queue and persisted data from the API", async () => {
    const user = generateUser({});
    const initialUserData = generateUserData({ user });
    const refreshedUserData = {
      ...initialUserData,
      businesses: {
        ...initialUserData.businesses,
        [initialUserData.currentBusinessId]: {
          ...initialUserData.businesses[initialUserData.currentBusinessId],
          profileData: generateProfileData({ businessName: "Refreshed business" }),
        },
      },
    };
    mockApi.getUserData.mockResolvedValueOnce(initialUserData);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });
    mockApi.getUserData.mockResolvedValueOnce(refreshedUserData);

    await act(async () => {
      await utils.result.current.refresh();
    });

    expect(mockApi.getUserData).toHaveBeenCalledTimes(2);
    expect(utils.result.current.business?.profileData.businessName).toBe("Refreshed business");
    expect(utils.storage.get(user.id)).toEqual(refreshedUserData);
  });

  it("does not apply a prior user's late refresh to the active user's queue", async () => {
    const firstUser = generateUser({ id: "first-user" });
    const secondUser = generateUser({ id: "second-user" });
    const firstUserData = generateUserData({ user: firstUser });
    const refreshedFirstUserData = {
      ...firstUserData,
      lastUpdatedISO: "2026-07-16T12:00:00.000Z",
    };
    const secondUserData = generateUserData({ user: secondUser });
    const refreshRequest = deferredPromise<UserData>();
    const secondUserRequest = deferredPromise<UserData>();
    mockApi.getUserData.mockResolvedValueOnce(firstUserData);
    const utils = renderUserDataHook({ authState: authenticatedState(firstUser.id) });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(firstUserData);
    });

    mockApi.getUserData
      .mockReturnValueOnce(refreshRequest.promise)
      .mockReturnValueOnce(secondUserRequest.promise);
    const firstUserRefresh = utils.result.current.refresh;
    let refreshPromise: Promise<void> = Promise.resolve();
    await act(async () => {
      refreshPromise = firstUserRefresh();
      await Promise.resolve();
    });

    await utils.setAuthState(authenticatedState(secondUser.id));
    secondUserRequest.resolve(secondUserData);
    await act(async () => {
      await secondUserRequest.promise;
    });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(secondUserData);
    });
    const secondUserQueue = utils.result.current.updateQueue;

    refreshRequest.resolve(refreshedFirstUserData);
    await act(async () => {
      await refreshPromise;
    });

    expect(secondUserQueue?.current()).toEqual(secondUserData);
    expect(utils.result.current.userData).toEqual(secondUserData);
    expect(utils.storage.get(firstUser.id)).toEqual(firstUserData);
  });

  it("runs one fetch and one set of synchronization effects for duplicate consumers", async () => {
    const request = deferredPromise<UserData>();
    const user = generateUser({});
    const userData = generateUserData({ user });
    mockApi.getUserData.mockReturnValue(request.promise);
    const utils = renderUserDataHook({
      authState: authenticatedState(user.id),
      multipleConsumers: true,
    });
    utils.intercom.setOperatingPhaseId.mockClear();
    utils.intercom.setLegalStructureId.mockClear();
    utils.intercom.setIndustryId.mockClear();
    utils.intercom.setBusinessPersona.mockClear();

    request.resolve(userData);
    await act(async () => {
      await request.promise;
    });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(userData);
    });

    expect(mockApi.getUserData).toHaveBeenCalledTimes(1);
    expect(utils.intercom.setOperatingPhaseId).toHaveBeenCalledTimes(1);
    expect(utils.intercom.setLegalStructureId).toHaveBeenCalledTimes(1);
    expect(utils.intercom.setIndustryId).toHaveBeenCalledTimes(1);
    expect(utils.intercom.setBusinessPersona).toHaveBeenCalledTimes(1);
  });

  it("never exposes the previous user's data after an identity switch", async () => {
    const firstUser = generateUser({ id: "first-user" });
    const secondUser = generateUser({ id: "second-user" });
    const firstUserData = generateUserData({ user: firstUser });
    const secondUserData = generateUserData({ user: secondUser });
    const secondRequest = deferredPromise<UserData>();
    mockApi.getUserData
      .mockResolvedValueOnce(firstUserData)
      .mockReturnValueOnce(secondRequest.promise);
    const utils = renderUserDataHook({ authState: authenticatedState(firstUser.id) });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(firstUserData);
    });

    await utils.setAuthState(authenticatedState(secondUser.id));

    expect(utils.result.current.userData).toBeUndefined();
    expect(utils.result.current.updateQueue).toBeUndefined();
    expect(utils.result.current.hasCompletedFetch).toBe(false);

    secondRequest.resolve(secondUserData);
    await act(async () => {
      await secondRequest.promise;
    });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(secondUserData);
    });
    expect(utils.result.current.hasCompletedFetch).toBe(true);
  });

  it("does not apply a prior user's late save error to the active user", async () => {
    const firstUser = generateUser({ id: "first-user" });
    const secondUser = generateUser({ id: "second-user" });
    const firstUserData = generateUserData({ user: firstUser });
    const secondUserData = generateUserData({ user: secondUser });
    const saveRequest = deferredPromise<UserData>();
    const secondUserRequest = deferredPromise<UserData>();
    mockApi.getUserData
      .mockResolvedValueOnce(firstUserData)
      .mockReturnValueOnce(secondUserRequest.promise);
    mockApi.postUserData.mockReturnValue(saveRequest.promise);
    const utils = renderUserDataHook({ authState: authenticatedState(firstUser.id) });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });

    let savePromise: Promise<void> = Promise.resolve();
    await act(async () => {
      savePromise =
        utils.result.current.updateQueue
          ?.queueProfileData({ businessName: "First user's edit" })
          .update() ?? Promise.resolve();
      await Promise.resolve();
    });

    await utils.setAuthState(authenticatedState(secondUser.id));
    expect(utils.result.current.userData).toBeUndefined();
    secondUserRequest.resolve(secondUserData);
    await act(async () => {
      await secondUserRequest.promise;
    });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(secondUserData);
    });

    saveRequest.reject(new Error("First user's save failed"));
    await act(async () => {
      await savePromise.catch(() => {});
    });

    expect(utils.result.current.userData).toEqual(secondUserData);
    expect(utils.result.current.error).toBeUndefined();
    expect(utils.setUserDataErrorCalls).not.toHaveBeenLastCalledWith("UPDATE_FAILED");
  });

  it("does not apply a prior user's late successful save after an identity switch", async () => {
    const firstUser = generateUser({ id: "first-user" });
    const secondUser = generateUser({ id: "second-user" });
    const firstUserData = generateUserData({ user: firstUser });
    const secondUserData = generateUserData({ user: secondUser });
    const canonicalFirstUserData = {
      ...firstUserData,
      businesses: {
        ...firstUserData.businesses,
        [firstUserData.currentBusinessId]: {
          ...firstUserData.businesses[firstUserData.currentBusinessId],
          profileData: generateProfileData({ businessName: "Canonical first user" }),
        },
      },
    };
    const saveRequest = deferredPromise<UserData>();
    const secondUserRequest = deferredPromise<UserData>();
    mockApi.getUserData
      .mockResolvedValueOnce(firstUserData)
      .mockReturnValueOnce(secondUserRequest.promise);
    mockApi.postUserData.mockReturnValue(saveRequest.promise);
    const utils = renderUserDataHook({ authState: authenticatedState(firstUser.id) });
    await waitFor(() => {
      expect(utils.result.current.updateQueue).toBeDefined();
    });

    let savePromise: Promise<void> = Promise.resolve();
    await act(async () => {
      savePromise =
        utils.result.current.updateQueue
          ?.queueProfileData({ businessName: "First user's optimistic edit" })
          .update() ?? Promise.resolve();
      await Promise.resolve();
    });

    await utils.setAuthState(authenticatedState(secondUser.id));
    secondUserRequest.resolve(secondUserData);
    await act(async () => {
      await secondUserRequest.promise;
    });
    await waitFor(() => {
      expect(utils.result.current.userData).toEqual(secondUserData);
    });
    mockBuildUserRoadmap.buildUserRoadmap.mockClear();

    saveRequest.resolve(canonicalFirstUserData);
    await act(async () => {
      await savePromise;
    });

    expect(utils.result.current.userData).toEqual(secondUserData);
    expect(utils.storage.get(secondUser.id)).toEqual(secondUserData);
    expect(
      utils.storage.get(firstUser.id)?.businesses[firstUserData.currentBusinessId].profileData
        .businessName,
    ).toBe("First user's optimistic edit");
    expect(mockBuildUserRoadmap.buildUserRoadmap).not.toHaveBeenCalled();
  });

  it("keeps business data aligned during an ordinary business switch", async () => {
    const user = generateUser({});
    const firstBusiness = generateBusiness({
      id: "first-business",
      userId: user.id,
      profileData: generateProfileData({ businessName: "First business" }),
    });
    const secondBusiness = generateBusiness({
      id: "second-business",
      userId: user.id,
      profileData: generateProfileData({ businessName: "Second business" }),
    });
    const initialUserData = generateUserData({
      user,
      currentBusinessId: firstBusiness.id,
      businesses: {
        [firstBusiness.id]: firstBusiness,
        [secondBusiness.id]: secondBusiness,
      },
    });
    mockApi.getUserData.mockResolvedValue(initialUserData);
    mockApi.postUserData.mockImplementation(async (userData) => userData);
    const utils = renderUserDataHook({ authState: authenticatedState(user.id) });
    await waitFor(() => {
      expect(utils.result.current.business?.id).toBe(firstBusiness.id);
    });

    await act(async () => {
      await utils.result.current.updateQueue?.queueSwitchBusiness(secondBusiness.id).update();
    });

    expect(utils.result.current.userData?.currentBusinessId).toBe(secondBusiness.id);
    expect(utils.result.current.business).toEqual(secondBusiness);
    expect(utils.result.current.business?.profileData.businessName).toBe("Second business");
  });
});
