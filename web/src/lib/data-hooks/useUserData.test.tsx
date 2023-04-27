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
import { act, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";

jest.mock("@/lib/utils/analytics-helpers", () => ({ setAnalyticsDimensions: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  getUserData: jest.fn(),
  postUserData: jest.fn(),
}));
const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;
const mockAnalyticsHelpers = analyticsHelpers as jest.Mocked<typeof analyticsHelpers>;
const mockApi = api as jest.Mocked<typeof api>;

const userDataStorage = UserDataStorageFactory();

const mockDispatch = jest.fn();

describe("useUserData", () => {
  let mockSetError: jest.Mock;
  let mockSetRoadmap: jest.Mock;

  beforeEach(() => {
    userDataStorage.clear();
    jest.resetAllMocks();
    mockSetError = jest.fn();
    mockSetRoadmap = jest.fn();
  });

  const setupHook = (
    currentUser: BusinessUser | undefined,
    isAuthenticated?: IsAuthenticated
  ): UseUserDataResponse => {
    const returnVal = generateUseUserDataResponse({});

    function TestComponent(): null {
      Object.assign(returnVal, useUserData());
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
          { user: currentUser, dispatch: mockDispatch, isAuthenticated }
        ),
        undefined,
        mockSetError
      )
    );
    return returnVal;
  };

  it("does not post update when local flag is true", async () => {
    const currentUser = generateUser({});
    const { update } = setupHook(currentUser);
    await act(() => {
      return update(generateUserData({}), { local: true });
    });
    expect(mockApi.postUserData).not.toHaveBeenCalled();
  });

  it("does not post update when user is unauthenticated", async () => {
    const currentUser = generateUser({});
    const { update } = setupHook(currentUser, IsAuthenticated.FALSE);
    await act(() => {
      return update(generateUserData({}));
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
    it("uses user id to get user data", () => {
      const currentUser = generateUser({});
      setupHook(currentUser);
      expect(mockApi.getUserData).toHaveBeenCalledWith(currentUser.id);
    });

    it("posts new user data when calling update", async () => {
      const currentUser = generateUser({});
      mockApi.postUserData.mockResolvedValue(generateUserData({}));

      const { update } = setupHook(currentUser);
      const newUserData = generateUserData({});
      await act(() => {
        return update(newUserData);
      });
      expect(mockApi.postUserData).toHaveBeenCalledWith(newUserData);
    });

    it("builds and sets roadmap when profile data changed", async () => {
      const returnedRoadmap = generateRoadmap({});
      mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(returnedRoadmap);

      const currentUser = generateUser({});
      mockApi.postUserData.mockResolvedValue(generateUserData({}));

      const { update } = setupHook(currentUser);

      const newUserData = generateUserData({});
      await act(() => {
        return update(newUserData);
      });

      const newProfileData = {
        ...newUserData.profileData,
        businessName: "some new name",
      };

      await act(() => {
        return update({
          ...newUserData,
          profileData: newProfileData,
        });
      });

      await waitFor(() => {
        return expect(mockBuildUserRoadmap.buildUserRoadmap).toHaveBeenCalledWith(newProfileData);
      });
      expect(mockSetRoadmap).toHaveBeenCalledWith(returnedRoadmap);
      expect(mockAnalyticsHelpers.setAnalyticsDimensions).toHaveBeenCalledWith(newProfileData);
    });

    it("updates data from api when calling refresh", async () => {
      const currentUser = generateUser({});

      const { refresh } = setupHook(currentUser);
      const newUserData = generateUserData({});
      mockApi.getUserData.mockResolvedValue(newUserData);
      await act(() => {
        return refresh();
      });

      expect(mockApi.getUserData).toHaveBeenCalled();
    });

    it("update auth state when data is initially loaded", async () => {
      const currentUser = generateUser({});
      const currentUserData = generateUserData({ user: { ...currentUser, myNJUserKey: "1234" } });
      mockApi.getUserData.mockResolvedValue(currentUserData);
      const { refresh } = setupHook(currentUser, IsAuthenticated.TRUE);
      await act(() => {
        return refresh();
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "UPDATE_USER",
        user: {
          ...currentUser,
          myNJUserKey: currentUserData.user.myNJUserKey,
        },
      });
    });

    it("sets error to NO_DATA when api call fails with no cache", async () => {
      const currentUser = generateUser({});
      const rejectedPromise = Promise.reject(500);
      mockApi.getUserData.mockReturnValue(rejectedPromise);
      const result = setupHook(currentUser);

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

      const { update } = setupHook(currentUser);
      const newUserData = generateUserData({});
      await act(() => {
        return update(newUserData).catch(() => {});
      });
      expect(mockSetError).toHaveBeenCalledWith("UPDATE_FAILED");
    });
  });

  describe("when there is a guest current user", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it("uses user id to get user data from cache", () => {
      const currentUser = generateUser({});
      const currentUserData = generateUserData({ user: currentUser });
      userDataStorage.set(currentUser.id, currentUserData);
      const { userData } = setupHook(currentUser, IsAuthenticated.FALSE);
      expect(mockApi.getUserData).not.toHaveBeenCalled();
      expect(userData).toEqual(currentUserData);
    });

    it("saves new user data to cache when calling update", async () => {
      const currentUser = generateUser({});
      const { update } = setupHook(currentUser, IsAuthenticated.FALSE);
      expect(userDataStorage.getCurrentUserData()).toBeUndefined();
      const currentUserData = generateUserData({ user: currentUser });
      await act(() => {
        return update(currentUserData);
      });
      expect(mockApi.postUserData).not.toHaveBeenCalled();
      expect(userDataStorage.getCurrentUserData()).toEqual(currentUserData);
    });

    it("does not update auth state when data is initially loaded", async () => {
      const currentUser = generateUser({});
      const currentUserData = generateUserData({ user: currentUser });
      userDataStorage.set(currentUser.id, currentUserData);
      const { refresh } = setupHook(currentUser, IsAuthenticated.FALSE);
      await act(() => {
        return refresh();
      });
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does not update data from api when calling refresh", async () => {
      const currentUser = generateUser({});
      const { refresh } = setupHook(currentUser, IsAuthenticated.FALSE);
      await act(() => {
        return refresh();
      });
      expect(mockApi.postUserData).not.toHaveBeenCalled();
    });
  });
});
