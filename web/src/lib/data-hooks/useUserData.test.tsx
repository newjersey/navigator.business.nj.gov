import * as api from "@/lib/api-client/apiClient";
import { useUserData, UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { generateUser, generateUserData } from "@/test/factories";
import { generateUseUserDataResponse, withAuth, withUserDataError } from "@/test/helpers";
import { BusinessUser } from "@businessnjgovnavigator/shared/";
import { act, render } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/api-client/apiClient", () => ({
  getUserData: jest.fn(),
  postUserData: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("useUserData", () => {
  let mockSetError: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockSetError = jest.fn();
  });

  const setupHook = (currentUser: BusinessUser | undefined): UseUserDataResponse => {
    const returnVal = generateUseUserDataResponse({});
    function TestComponent() {
      Object.assign(returnVal, useUserData());
      return null;
    }
    render(withUserDataError(withAuth(<TestComponent />, { user: currentUser }), undefined, mockSetError));
    return returnVal;
  };

  it("does not post update when local flag is true", async () => {
    const currentUser = generateUser({});
    const { update } = setupHook(currentUser);
    await act(() => update(generateUserData({}), { local: true }));
    expect(mockApi.postUserData).not.toHaveBeenCalled();
  });

  describe("when there is no current user", () => {
    it("does not call to get user data", () => {
      setupHook(undefined);
      expect(mockApi.getUserData).not.toHaveBeenCalled();
    });
  });

  describe("when there is a current user", () => {
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
      await act(() => update(newUserData));
      expect(mockApi.postUserData).toHaveBeenCalledWith(newUserData);
    });

    it("updates data from api when calling refresh", async () => {
      const currentUser = generateUser({});

      const { refresh } = setupHook(currentUser);
      const newUserData = generateUserData({});
      mockApi.getUserData.mockResolvedValue(newUserData);
      await act(() => refresh());

      expect(mockApi.getUserData).toHaveBeenCalled();
    });

    it("sets error to NO_DATA when api call fails with no cache", async () => {
      const currentUser = generateUser({});
      const rejectedPromise = Promise.reject(500);
      mockApi.getUserData.mockReturnValue(rejectedPromise);
      const result = setupHook(currentUser);

      await act(() => rejectedPromise.catch(() => {}));

      expect(mockSetError).toHaveBeenCalledWith("NO_DATA");
      expect(result.userData).toEqual(undefined);
    });

    it("sets error to UPDATE_FAILED error when update function rejects", async () => {
      const currentUser = generateUser({});
      mockApi.getUserData.mockResolvedValue(generateUserData({}));
      mockApi.postUserData.mockRejectedValue(400);

      const { update } = setupHook(currentUser);
      const newUserData = generateUserData({});
      await act(() => update(newUserData).catch(() => {}));
      expect(mockSetError).toHaveBeenCalledWith("UPDATE_FAILED");
    });
  });
});
