import { generateFormData, generateUser, generateUserData } from "../../test/factories";

import * as session from "./sessionHelper";
import * as api from "../api-client/apiClient";
import { onSignIn, onSignOut } from "./signinHelper";
jest.mock("./sessionHelper", () => ({
  getCurrentUser: jest.fn(),
}));
const mockSession = session as jest.Mocked<typeof session>;

jest.mock("../api-client/apiClient", () => ({
  getUserData: jest.fn(),
  postUserData: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("AuthHelper", () => {
  let mockPush: jest.Mock;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    mockDispatch = jest.fn();
  });

  describe("onSignIn", () => {
    it("dispatches current user login", async () => {
      mockApi.getUserData.mockResolvedValue(generateUserData({}));

      const user = generateUser({});
      mockSession.getCurrentUser.mockResolvedValue(user);
      await onSignIn(mockPush, mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN",
        user: user,
      });
    });

    it("if user form progress is completed, pushes to roadmap with type", async () => {
      mockApi.getUserData.mockResolvedValue(
        generateUserData({
          formData: generateFormData({ businessType: { businessType: "e-commerce" } }),
          formProgress: "COMPLETED",
        })
      );
      const user = generateUser({ id: "123" });
      mockSession.getCurrentUser.mockResolvedValue(user);

      await onSignIn(mockPush, mockDispatch);

      expect(mockPush).toHaveBeenCalledWith("/roadmaps/e-commerce");
      expect(mockApi.getUserData).toHaveBeenCalledWith("123");
    });

    it("if user form progress is unstarted, pushes to homepage", async () => {
      mockApi.getUserData.mockResolvedValue(
        generateUserData({
          formProgress: "UNSTARTED",
        })
      );
      const user = generateUser({ id: "123" });
      mockSession.getCurrentUser.mockResolvedValue(user);
      await onSignIn(mockPush, mockDispatch);
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockApi.getUserData).toHaveBeenCalledWith("123");
    });

    it("if user form progress is in-progress, pushes to homepage", async () => {
      mockApi.getUserData.mockResolvedValue(
        generateUserData({
          formProgress: "IN-PROGRESS",
        })
      );
      const user = generateUser({ id: "123" });
      mockSession.getCurrentUser.mockResolvedValue(user);
      await onSignIn(mockPush, mockDispatch);
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockApi.getUserData).toHaveBeenCalledWith("123");
    });

    it("if user does not exist, post new user data", async () => {
      const user = generateUser({ id: "123" });
      mockApi.getUserData.mockRejectedValue(undefined);
      mockApi.postUserData.mockResolvedValue(generateUserData({ user: user }));

      mockSession.getCurrentUser.mockResolvedValue(user);

      await onSignIn(mockPush, mockDispatch);
      expect(mockApi.getUserData).toHaveBeenCalledWith("123");
      expect(mockApi.postUserData.mock.calls[0][0].user).toEqual(user);
      expect(mockApi.postUserData.mock.calls[0][0].formData.user.email).toEqual(user.email);
      expect(mockApi.postUserData.mock.calls[0][0].formData.user.firstName).toEqual(undefined);
      expect(mockApi.postUserData.mock.calls[0][0].formData.user.lastName).toEqual(undefined);
      expect(mockApi.postUserData.mock.calls[0][0].formData.businessType).toEqual(undefined);
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  describe("onSignOut", () => {
    it("dispatches a logout with undefined user", () => {
      onSignOut(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGOUT",
        user: undefined,
      });
    });
  });
});
