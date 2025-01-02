import { RoadmapContext } from "@/contexts/roadmapContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData, UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import * as analyticsHelpers from "@/lib/utils/analytics-helpers";
import { generateRoadmap } from "@/test/factories";
import { withAuth, withUserDataError } from "@/test/helpers/helpers-renderers";
import { generateUseUserDataResponse } from "@/test/mock/mockUseUserData";
import { BusinessUser, generateUser, generateUserData } from "@businessnjgovnavigator/shared/";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { act, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";

vi.mock("@/lib/utils/analytics-helpers", () => ({ setAnalyticsDimensions: vi.fn() }));
vi.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({
  getUserData: vi.fn(),
  postUserData: vi.fn(),
}));
const mockBuildUserRoadmap = buildUserRoadmap as vi.Mocked<typeof buildUserRoadmap>;
const mockAnalyticsHelpers = analyticsHelpers as vi.Mocked<typeof analyticsHelpers>;
const mockApi = api as vi.Mocked<typeof api>;

const userDataStorage = UserDataStorageFactory();

const mockDispatch = vi.fn();

describe("useUserData", () => {
  let mockSetError: vi.Mock;
  let mockSetRoadmap: vi.Mock;

  beforeEach(() => {
    userDataStorage.clear();
    vi.resetAllMocks();
    mockSetError = vi.fn();
    mockSetRoadmap = vi.fn();
    mockApi.postUserData.mockResolvedValue(generateUserData({}));
  });

  const setupHook = async (
    currentUser: BusinessUser | undefined,
    isAuthenticated?: IsAuthenticated
  ): Promise<UseUserDataResponse> => {
    const returnVal = generateUseUserDataResponse({});

    function TestComponent(): null {
      Object.assign(returnVal, useUserData());
      returnVal.createUpdateQueue(returnVal.userData as UserData).then((createdQueue) => {
        returnVal.updateQueue = createdQueue;
      });
      return null;
    }

    render(
      withUserDataError(
        withAuth(
          <RoadmapContext.Provider
            value={{
              roadmap: generateRoadmap({}),
              setRoadmap: mockSetRoadmap,
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <SWRConfig value={{ provider: (): any => userDataStorage }}>
              <TestComponent />
            </SWRConfig>
          </RoadmapContext.Provider>,
          { activeUser: currentUser, dispatch: mockDispatch, isAuthenticated }
        ),
        undefined,
        mockSetError
      )
    );
    await waitFor(() => {
      expect(returnVal.updateQueue).toBeDefined();
    });
    return returnVal;
  };

  it("does not post update when local flag is true", async () => {
    const currentUser = generateUser({});
    const { updateQueue } = await setupHook(currentUser);
    await act(() => {
      return updateQueue?.queue(generateUserData({})).update({ local: true });
    });
    expect(mockApi.postUserData).not.toHaveBeenCalled();
  });

  it("does not post update when user is unauthenticated", async () => {
    const currentUser = generateUser({});
    const { updateQueue } = await setupHook(currentUser, IsAuthenticated.FALSE);
    await act(() => {
      return updateQueue?.queue(generateUserData({})).update();
    });
    expect(mockApi.postUserData).not.toHaveBeenCalled();
  });

  describe("when there is no current user", () => {
    it("does not call to get user data", () => {
      setupHook(undefined);
      expect(mockApi.getUserData).not.toHaveBeenCalled();
    });
  });

  describe("when there is a authenticated current user", () => {
    it("uses user id to get user data", async () => {
      const currentUser = generateUser({});
      await setupHook(currentUser);
      expect(mockApi.getUserData).toHaveBeenCalledWith(currentUser.id);
    });

    it("posts new user data when calling update", async () => {
      const currentUser = generateUser({});
      const data = generateUserData({});
      mockApi.postUserData.mockResolvedValue(data);

      const { updateQueue, createUpdateQueue } = await setupHook(currentUser);
      await act(() => {
        return createUpdateQueue(generateUserData({}));
      });
      const newUserData = generateUserData({});
      await act(() => {
        return updateQueue?.queue(newUserData).update();
      });
      expect(mockApi.postUserData).toHaveBeenLastCalledWith(newUserData);
    });

    it("builds and sets roadmap when profile data changed", async () => {
      const returnedRoadmap = generateRoadmap({});
      mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(returnedRoadmap);

      const currentUser = generateUser({});
      mockApi.postUserData.mockResolvedValue(generateUserData({}));

      const { updateQueue } = await setupHook(currentUser);

      const newUserData = generateUserData({});
      await act(() => {
        return updateQueue?.queue(newUserData).update();
      });

      await act(() => {
        return updateQueue?.queueProfileData({ businessName: "some new name" }).update();
      });

      const expectedProfileData = {
        ...newUserData.businesses[newUserData.currentBusinessId].profileData,
        businessName: "some new name",
      };

      await waitFor(() => {
        return expect(mockBuildUserRoadmap.buildUserRoadmap).toHaveBeenCalledWith(expectedProfileData);
      });
      expect(mockSetRoadmap).toHaveBeenCalledWith(returnedRoadmap);
      expect(mockAnalyticsHelpers.setAnalyticsDimensions).toHaveBeenCalledWith(expectedProfileData);
    });

    it("updates data from api when calling refresh", async () => {
      const currentUser = generateUser({});

      const { refresh } = await setupHook(currentUser);
      const newUserData = generateUserData({});
      mockApi.getUserData.mockResolvedValue(newUserData);
      await act(() => {
        return refresh();
      });

      expect(mockApi.getUserData).toHaveBeenCalled();
    });

    it("sets error to NO_DATA when api call fails with no cache", async () => {
      const currentUser = generateUser({});
      const rejectedPromise = Promise.reject(500);
      mockApi.getUserData.mockReturnValue(rejectedPromise);
      const result = await setupHook(currentUser);

      await act(() => {
        return rejectedPromise.catch(() => {});
      });

      expect(mockSetError).toHaveBeenCalledWith("NO_DATA");
      expect(result.userData).toEqual(undefined);
    });

    it("sets error to UPDATE_FAILED error when update function rejects", async () => {
      const currentUser = generateUser({});
      mockApi.getUserData.mockResolvedValue(generateUserData({}));
      mockApi.postUserData.mockRejectedValue(400);

      const { updateQueue } = await setupHook(currentUser);
      const newUserData = generateUserData({});
      await act(() => {
        return updateQueue
          ?.queue(newUserData)
          .update()
          .catch(() => {});
      });
      expect(mockSetError).toHaveBeenCalledWith("UPDATE_FAILED");
    });
  });

  describe("when there is a guest current user", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("uses user id to get user data from cache", async () => {
      const currentUser = generateUser({});
      const currentUserData = generateUserData({ user: currentUser });
      userDataStorage.set(currentUser.id, currentUserData);
      await setupHook(currentUser, IsAuthenticated.FALSE);
      expect(mockApi.getUserData).not.toHaveBeenCalled();
    });

    it("saves new user data to cache when calling update", async () => {
      const currentUser = generateUser({});
      const { updateQueue } = await setupHook(currentUser, IsAuthenticated.FALSE);
      expect(userDataStorage.getCurrentUserData()).toBeUndefined();
      const currentUserData = generateUserData({ user: currentUser });
      await act(() => {
        return updateQueue?.queue(currentUserData).update();
      });
      expect(mockApi.postUserData).not.toHaveBeenCalled();
      expect(userDataStorage.getCurrentUserData()).toEqual(currentUserData);
    });

    it("does not update auth state when data is initially loaded", async () => {
      const currentUser = generateUser({});
      const currentUserData = generateUserData({ user: currentUser });
      userDataStorage.set(currentUser.id, currentUserData);
      const { refresh } = await setupHook(currentUser, IsAuthenticated.FALSE);
      await act(() => {
        return refresh();
      });
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not update data from api when calling refresh", async () => {
      const currentUser = generateUser({});
      const { refresh } = await setupHook(currentUser, IsAuthenticated.FALSE);
      await act(() => {
        return refresh();
      });
      expect(mockApi.postUserData).not.toHaveBeenCalled();
    });
  });
});
