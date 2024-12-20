import * as api from "@/lib/api-client/apiClient";
import { AuthAction } from "@/lib/auth/AuthContext";
import * as session from "@/lib/auth/sessionHelper";
import { onGuestSignIn, onSelfRegister, onSignIn, onSignOut, SelfRegRouter } from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import * as AccountLinkingErrorStorage from "@/lib/storage/AccountLinkingErrorStorage";
import * as UserDataStorage from "@/lib/storage/UserDataStorage";
import { generateActiveUser } from "@/test/factories";
import { getLastCalledWith } from "@/test/helpers/helpers-utilities";
import { generateUser, generateUserData } from "@businessnjgovnavigator/shared/";
import {
  generateBusiness,
  generatePreferences,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { waitFor } from "@testing-library/react";
import { UpdateQueue } from "../types/types";
import { UpdateQueueFactory } from "../UpdateQueue";

const mockGetCurrentUserData = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/lib/storage/UserDataStorage");
jest.mock("@/lib/storage/AccountLinkingErrorStorage");
const mockUserDataStorage = UserDataStorage as jest.Mocked<typeof UserDataStorage>;
const mockAccountLinkingErrorStorage = AccountLinkingErrorStorage as jest.Mocked<
  typeof AccountLinkingErrorStorage
>;
const originalModule = jest.requireActual("@/lib/storage/UserDataStorage");

jest.mock("@/lib/auth/sessionHelper", () => ({
  getActiveUser: jest.fn(),
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

    mockAccountLinkingErrorStorage.AccountLinkingErrorStorageFactory.mockImplementation(() => ({
      setEncounteredMyNjLinkingError: jest.fn(),
      getEncounteredMyNjLinkingError: jest.fn(),
    }));
  });

  describe("onSignIn", () => {
    it("dispatches current user login", async () => {
      mockApi.getUserData.mockResolvedValue(generateUserData({}));

      const activeUser = generateActiveUser({});
      mockSession.getActiveUser.mockResolvedValue(activeUser);
      await onSignIn(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN",
        activeUser: activeUser,
      });
    });
  });

  describe("onSelfRegister", () => {
    let userData: UserData;
    let updateQueue: UpdateQueue;
    let update: jest.Mock;
    let mockSetRegistrationStatus: jest.Mock;
    let fakeRouter: SelfRegRouter;

    beforeEach(() => {
      userData = generateUserData({});
      update = jest.fn();
      updateQueue = new UpdateQueueFactory(userData, update);
      mockSetRegistrationStatus = jest.fn();
      fakeRouter = { replace: mockPush, asPath: "/tasks/some-url" };
    });

    it("sets registration status to IN_PROGRESS", async () => {
      mockApi.postSelfReg.mockResolvedValue({ userData: userData, authRedirectURL: "" });
      await onSelfRegister({
        router: fakeRouter,
        updateQueue,
        userData,
        setRegistrationStatus: mockSetRegistrationStatus,
      });
      expect(mockSetRegistrationStatus).toHaveBeenCalledWith("IN_PROGRESS");
    });

    it("does not use a returnToLink if path is account-setup", async () => {
      const business = generateBusiness(generateUserData({}), {
        preferences: generatePreferences({ returnToLink: "" }),
      });
      userData = generateUserDataForBusiness(business);
      updateQueue = new UpdateQueueFactory(userData, update);

      mockApi.postSelfReg.mockResolvedValue({ userData: userData, authRedirectURL: "" });
      await onSelfRegister({
        router: fakeRouter,
        updateQueue,
        userData,
        setRegistrationStatus: mockSetRegistrationStatus,
      });
      expect(mockApi.postSelfReg).toHaveBeenCalledWith({
        ...userData,
        businesses: {
          [userData.currentBusinessId]: {
            ...userData.businesses[userData.currentBusinessId],
            preferences: {
              ...userData.businesses[userData.currentBusinessId].preferences,
              returnToLink: "/tasks/some-url",
            },
          },
        },
      });
    });

    it("posts userData to api self-reg with current pathname included when returnToLink is empty", async () => {
      fakeRouter = { replace: mockPush, asPath: ROUTES.accountSetup };
      const business = generateBusiness(generateUserData({}), {
        preferences: generatePreferences({ returnToLink: "" }),
      });

      userData = generateUserDataForBusiness(business);
      updateQueue = new UpdateQueueFactory(userData, update);

      mockApi.postSelfReg.mockResolvedValue({ userData: userData, authRedirectURL: "" });
      await onSelfRegister({
        router: fakeRouter,
        updateQueue,
        userData,
        setRegistrationStatus: mockSetRegistrationStatus,
      });

      expect(mockApi.postSelfReg).toHaveBeenCalledWith({
        ...userData,
        businesses: {
          [userData.currentBusinessId]: {
            ...userData.businesses[userData.currentBusinessId],
            preferences: {
              ...userData.businesses[userData.currentBusinessId].preferences,
              returnToLink: "",
            },
          },
        },
      });
    });

    it("posts userData to api self-reg with the returnToLink if exists", async () => {
      const business = generateBusiness(generateUserData({}), {
        preferences: generatePreferences({ returnToLink: "/pathname?query=true" }),
      });
      userData = generateUserDataForBusiness(business);
      updateQueue = new UpdateQueueFactory(userData, update);
      mockApi.postSelfReg.mockResolvedValue({ userData: userData, authRedirectURL: "" });
      await onSelfRegister({
        router: fakeRouter,
        updateQueue,
        userData,
        setRegistrationStatus: mockSetRegistrationStatus,
      });
      expect(mockApi.postSelfReg).toHaveBeenCalledWith({
        ...userData,
        businesses: {
          [userData.currentBusinessId]: {
            ...userData.businesses[userData.currentBusinessId],
            preferences: {
              ...userData.businesses[userData.currentBusinessId].preferences,
              returnToLink: "/pathname?query=true",
            },
          },
        },
      });
    });

    it("updates userData and redirects to authRedirect on success", async () => {
      const returnedUserData = generateUserData({});
      mockApi.postSelfReg.mockResolvedValue({
        userData: returnedUserData,
        authRedirectURL: "/some-url",
      });
      await onSelfRegister({
        router: fakeRouter,
        updateQueue,
        userData,
        setRegistrationStatus: mockSetRegistrationStatus,
      });
      await waitFor(() => {
        return expect(mockPush).toHaveBeenCalledWith("/some-url");
      });
      expect(update).toHaveBeenCalledWith(returnedUserData, undefined);
    });

    it("sets alert to DUPLICATE_ERROR on 409 response code", async () => {
      mockApi.postSelfReg.mockRejectedValue(409);
      await onSelfRegister({
        router: fakeRouter,
        updateQueue,
        userData,
        setRegistrationStatus: mockSetRegistrationStatus,
      });
      await waitFor(() => {
        return expect(mockSetRegistrationStatus).toHaveBeenCalledWith("DUPLICATE_ERROR");
      });
      expect(update).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("sets alert to RESPONSE_ERROR on generic error", async () => {
      mockApi.postSelfReg.mockRejectedValue(500);
      await onSelfRegister({
        router: fakeRouter,
        updateQueue,
        userData,
        setRegistrationStatus: mockSetRegistrationStatus,
      });
      await waitFor(() => {
        return expect(mockSetRegistrationStatus).toHaveBeenCalledWith("RESPONSE_ERROR");
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
      await onGuestSignIn({ push: mockPush, pathname: ROUTES.landing, dispatch: mockDispatch });
      expect(userStorageMock).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN_GUEST",
        activeUser: {
          email: user.email,
          id: user.id,
        },
      });
    });

    it("dispatches empty user with encounteredMyNjLinkingError when param is true", async () => {
      mockGetCurrentUserData.mockImplementation(() => {
        return undefined;
      });
      await onGuestSignIn({
        push: mockPush,
        pathname: ROUTES.landing,
        dispatch: mockDispatch,
        encounteredMyNjLinkingError: true,
      });
      expect(
        getLastCalledWith<unknown, AuthAction>(mockDispatch)[0].activeUser?.encounteredMyNjLinkingError
      ).toEqual(true);
    });

    it("gets account linking error from storage when param encounteredMyNjLinkingError param is undefined", async () => {
      mockGetCurrentUserData.mockImplementation(() => {
        return undefined;
      });

      const mockGetFn = jest.fn().mockReturnValue(true);

      mockAccountLinkingErrorStorage.AccountLinkingErrorStorageFactory.mockImplementation(() => ({
        setEncounteredMyNjLinkingError: jest.fn(),
        getEncounteredMyNjLinkingError: mockGetFn,
      }));

      await onGuestSignIn({ push: mockPush, pathname: ROUTES.landing, dispatch: mockDispatch });
      expect(mockGetFn).toHaveBeenCalled();
      expect(
        getLastCalledWith<unknown, AuthAction>(mockDispatch)[0].activeUser?.encounteredMyNjLinkingError
      ).toEqual(true);
    });

    it("saves account linking error to storage", async () => {
      mockGetCurrentUserData.mockImplementation(() => {
        return undefined;
      });
      const mockSetFn = jest.fn();

      mockAccountLinkingErrorStorage.AccountLinkingErrorStorageFactory.mockImplementation(() => ({
        setEncounteredMyNjLinkingError: mockSetFn,
        getEncounteredMyNjLinkingError: jest.fn(),
      }));

      await onGuestSignIn({
        push: mockPush,
        pathname: ROUTES.landing,
        dispatch: mockDispatch,
        encounteredMyNjLinkingError: true,
      });
      expect(mockSetFn).toHaveBeenCalledWith(true);
    });

    it("redirect user to onboarding if still in progress", async () => {
      const userData = generateUserDataForBusiness(
        generateBusiness(generateUserData({}), { onboardingFormProgress: "UNSTARTED" })
      );
      mockGetCurrentUserData.mockImplementation(() => {
        return userData;
      });
      mockSession.getActiveUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn({ push: mockPush, pathname: ROUTES.landing, dispatch: mockDispatch });
      expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
    });

    it("redirect user to home if no user data is found", async () => {
      mockGetCurrentUserData.mockImplementation(() => {
        return undefined;
      });
      mockSession.getActiveUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn({ push: mockPush, pathname: ROUTES.dashboard, dispatch: mockDispatch });
      expect(mockPush).toHaveBeenCalledWith(ROUTES.landing);
    });

    it("does not redirect user when at /onboarding", async () => {
      mockGetCurrentUserData.mockImplementation(() => {
        return undefined;
      });
      mockSession.getActiveUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn({ push: mockPush, pathname: ROUTES.onboarding, dispatch: mockDispatch });
      expect(mockPush).not.toHaveBeenCalledWith(ROUTES.landing);
    });

    it("does not redirect user when at /welcome", async () => {
      mockGetCurrentUserData.mockImplementation(() => {
        return undefined;
      });
      mockSession.getActiveUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn({ push: mockPush, pathname: ROUTES.welcome, dispatch: mockDispatch });
      expect(mockPush).not.toHaveBeenCalledWith(ROUTES.landing);
    });
  });

  describe("onSignOut", () => {
    it("dispatches a logout with undefined user", async () => {
      const user = generateActiveUser({});
      mockSession.getActiveUser.mockResolvedValue(user);
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
