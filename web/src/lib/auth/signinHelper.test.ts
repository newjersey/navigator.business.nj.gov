import * as api from "@/lib/api-client/apiClient";
import { onGuestSignIn, onSelfRegister, onSignIn, onSignOut, SelfRegRouter } from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import * as UserDataStorage from "@/lib/storage/UserDataStorage";
import { generateUser, generateUserData } from "@/test/factories";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { waitFor } from "@testing-library/react";
import * as session from "./sessionHelper";

const mockGetCurrentUserData = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/lib/storage/UserDataStorage");
const mockUserDataStorage = UserDataStorage as jest.Mocked<typeof UserDataStorage>;
const originalModule = jest.requireActual("@/lib/storage/UserDataStorage");

jest.mock("./sessionHelper", () => ({
  getCurrentUser: jest.fn(),
  triggerSignOut: jest.fn().mockResolvedValue({}),
}));

const mockSession = session as jest.Mocked<typeof session>;

jest.mock("@/lib/api-client/apiClient", () => ({
  getUserData: jest.fn(),
  postUserData: jest.fn(),
  postSelfReg: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("SigninHelper", () => {
  let mockPush: jest.Mock;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    jest.restoreAllMocks();
    mockPush = jest.fn();
    mockDispatch = jest.fn();
    mockUserDataStorage.UserDataStorageFactory.mockImplementation(() => ({
      ...originalModule.UserDataStorageFactory(),
      getCurrentUserData: mockGetCurrentUserData,
      delete: mockDelete,
    }));
  });

  describe("onSignIn", () => {
    it("dispatches current user login", async () => {
      mockApi.getUserData.mockResolvedValue(generateUserData({}));

      const user = generateUser({});
      mockSession.getCurrentUser.mockResolvedValue(user);
      await onSignIn(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN",
        user: user,
      });
    });
  });

  describe("onSelfRegister", () => {
    let userData: UserData;
    let update: jest.Mock;
    let mockSetAlertStatus: jest.Mock;
    let fakeRouter: SelfRegRouter;

    beforeEach(() => {
      userData = generateUserData({});
      update = jest.fn();
      mockSetAlertStatus = jest.fn();
      fakeRouter = { replace: mockPush, asPath: "/tasks/some-url" };
    });

    it("sets registration alert to IN_PROGRESS", async () => {
      mockApi.postSelfReg.mockResolvedValue({ userData: userData, authRedirectURL: "" });
      await onSelfRegister(fakeRouter, userData, update, mockSetAlertStatus);
      expect(mockSetAlertStatus).toHaveBeenCalledWith("IN_PROGRESS");
    });

    it("posts userData to api self-reg with current pathname included", async () => {
      mockApi.postSelfReg.mockResolvedValue({ userData: userData, authRedirectURL: "" });
      await onSelfRegister(fakeRouter, userData, update, mockSetAlertStatus);
      expect(mockApi.postSelfReg).toHaveBeenCalledWith({
        ...userData,
        preferences: { ...userData.preferences, returnToLink: "/tasks/some-url" },
      });
    });

    it("posts userData to api self-reg with the returnToLink if called with true for the useReturnToLink", async () => {
      userData = generateUserData({
        preferences: { ...userData.preferences, returnToLink: "/pathname?query=true" },
      });
      mockApi.postSelfReg.mockResolvedValue({ userData: userData, authRedirectURL: "" });
      await onSelfRegister(fakeRouter, userData, update, mockSetAlertStatus, true);
      expect(mockApi.postSelfReg).toHaveBeenCalledWith({
        ...userData,
        preferences: { ...userData.preferences, returnToLink: "/pathname?query=true" },
      });
    });

    it("updates userData and redirects to authRedirect on success", async () => {
      const returnedUserData = generateUserData({});
      mockApi.postSelfReg.mockResolvedValue({
        userData: returnedUserData,
        authRedirectURL: "/some-url",
      });
      await onSelfRegister(fakeRouter, userData, update, mockSetAlertStatus);
      await waitFor(() => {
        return expect(mockPush).toHaveBeenCalledWith("/some-url");
      });
      expect(update).toHaveBeenCalledWith(returnedUserData);
    });

    it("sets alert to DUPLICATE_ERROR on 409 response code", async () => {
      mockApi.postSelfReg.mockRejectedValue(409);
      await onSelfRegister(fakeRouter, userData, update, mockSetAlertStatus);
      await waitFor(() => {
        return expect(mockSetAlertStatus).toHaveBeenCalledWith("DUPLICATE_ERROR");
      });
      expect(update).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("sets alert to RESPONSE_ERROR on generic error", async () => {
      mockApi.postSelfReg.mockRejectedValue(500);
      await onSelfRegister(fakeRouter, userData, update, mockSetAlertStatus);
      await waitFor(() => {
        return expect(mockSetAlertStatus).toHaveBeenCalledWith("RESPONSE_ERROR");
      });
      expect(update).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("onGuestSignIn", () => {
    it("dispatches guest user login", async () => {
      const user = generateUser({});
      const userData = generateUserData({ user });
      const userStorageMock = mockGetCurrentUserData.mockImplementation(() => {
        return userData;
      });
      await onGuestSignIn(mockPush, ROUTES.landing, mockDispatch);
      expect(userStorageMock).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN_GUEST",
        user: user,
      });
    });

    it("redirect user to onboarding if still in progress", async () => {
      const user = generateUser({});
      const userData = generateUserData({ user, onboardingFormProgress: "UNSTARTED" });
      mockGetCurrentUserData.mockImplementation(() => {
        return userData;
      });
      mockSession.getCurrentUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn(mockPush, ROUTES.landing, mockDispatch);
      expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
    });

    it("redirect user to home if no user data is found", async () => {
      mockGetCurrentUserData.mockImplementation(() => {
        return undefined;
      });
      mockSession.getCurrentUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn(mockPush, ROUTES.dashboard, mockDispatch);
      expect(mockPush).toHaveBeenCalledWith(ROUTES.landing);
    });

    it("does not redirect user when at /onboarding", async () => {
      mockGetCurrentUserData.mockImplementation(() => {
        return undefined;
      });
      mockSession.getCurrentUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn(mockPush, ROUTES.onboarding, mockDispatch);
      expect(mockPush).not.toHaveBeenCalledWith(ROUTES.landing);
    });
  });

  describe("onSignOut", () => {
    it("dispatches a logout with undefined user", async () => {
      const user = generateUser({});
      mockSession.getCurrentUser.mockResolvedValue(user);
      const userStorageMock = mockDelete.mockImplementation(() => {});
      await onSignOut(mockPush, mockDispatch);
      expect(mockSession.triggerSignOut).toHaveBeenCalled();
      expect(userStorageMock).toHaveBeenCalledWith(user.id);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGOUT",
        user: undefined,
      });
      expect(mockPush).toHaveBeenCalledWith(ROUTES.landing);
    });
  });
});
