import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData, UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { generateUser, generateUserData } from "@/test/factories";
import { withAuth, withUserDataError } from "@/test/helpers/helpers-renderers";
import { generateUseUserDataResponse } from "@/test/mock/mockUseUserData";
import { BusinessUser } from "@businessnjgovnavigator/shared/";
import { act, render } from "@testing-library/react";
import { SWRConfig } from "swr";

jest.mock("@/lib/api-client/apiClient", () => {
  return {
    getUserData: jest.fn(),
    postUserData: jest.fn(),
  };
});
const mockApi = api as jest.Mocked<typeof api>;

const userDataStorage = UserDataStorageFactory();

const mockDispatch = jest.fn();

describe("useUserData", () => {
  let mockSetError: jest.Mock;

  beforeEach(() => {
    userDataStorage.clear();
    jest.resetAllMocks();
    mockSetError = jest.fn();
  });

  const setupHook = (
    currentUser: BusinessUser | undefined,
    isAuthenticated?: IsAuthenticated
  ): UseUserDataResponse => {
    const returnVal = generateUseUserDataResponse({});
    function TestComponent() {
      Object.assign(returnVal, useUserData());
      return null;
    }
    render(
      withUserDataError(
        withAuth(
          <>
            <SWRConfig
              value={{
                provider: () => {
                  return userDataStorage;
                },
              }}
            >
              <TestComponent />
            </SWRConfig>
          </>,
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
