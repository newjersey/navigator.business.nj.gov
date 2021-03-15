import { useUserData, UseUserDataResponse } from "./useUserData";
import { generateUseUserDataResponse, renderWithUser } from "../../test/helpers";
import { BusinessUser } from "../types/types";
import * as api from "../api-client/apiClient";
import { generateUser, generateUserData } from "../../test/factories";
import { act } from "@testing-library/react";

jest.mock("../api-client/apiClient", () => ({
  getUserData: jest.fn(),
  postUserData: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("useUserData", () => {
  const setupHook = (currentUser: BusinessUser | undefined): UseUserDataResponse => {
    const returnVal = generateUseUserDataResponse({});
    function TestComponent() {
      Object.assign(returnVal, useUserData());
      return null;
    }
    renderWithUser(<TestComponent />, currentUser, jest.fn());
    return returnVal;
  };

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
      const { update } = setupHook(currentUser);
      const newUserData = generateUserData({});
      await act(() => update(newUserData));
      expect(mockApi.postUserData).toHaveBeenCalledWith(newUserData);
    });
  });
});
