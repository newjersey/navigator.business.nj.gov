import * as api from "@/lib/api-client/apiClient";
import { onGuestSignIn, onSignIn, onSignOut } from "@/lib/auth/signinHelper";
import { generateUser, generateUserData } from "@/test/factories";
import * as session from "./sessionHelper";

const userDataStorage = {
  getCurrentUserData: jest.fn(),
  delete: jest.fn(),
};

jest.mock("@/lib/utils/userDataStorage", () => ({
  UserDataStorage: jest.fn(() => userDataStorage),
}));

jest.mock("./sessionHelper", () => ({
  getCurrentUser: jest.fn(),
  triggerSignOut: jest.fn().mockResolvedValue({}),
}));
const mockSession = session as jest.Mocked<typeof session>;

jest.mock("@/lib/api-client/apiClient", () => ({
  getUserData: jest.fn(),
  postUserData: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("SigninHelper", () => {
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
  });

  describe("onGuestSignIn", () => {
    it("dispatches guest user login", async () => {
      const user = generateUser({});
      const userData = generateUserData({ user });
      const userStorageMock = userDataStorage.getCurrentUserData.mockImplementation(() => userData);
      await onGuestSignIn(mockPush, mockDispatch);
      expect(userStorageMock).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN_GUEST",
        user: user,
      });
    });

    it("redirect user to onboarding if still in progress", async () => {
      const user = generateUser({});
      const userData = generateUserData({ user, formProgress: "UNSTARTED" });
      userDataStorage.getCurrentUserData.mockImplementation(() => userData);
      mockSession.getCurrentUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn(mockPush, mockDispatch);
      expect(mockPush).toHaveBeenCalledWith("/onboarding");
    });

    it("redirect user to home if no user data is found", async () => {
      userDataStorage.getCurrentUserData.mockImplementation(() => undefined);
      mockSession.getCurrentUser.mockImplementation(() => {
        throw new Error("New");
      });
      await onGuestSignIn(mockPush, mockDispatch);
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  describe("onSignOut", () => {
    it("dispatches a logout with undefined user", async () => {
      const user = generateUser({});
      mockSession.getCurrentUser.mockResolvedValue(user);
      const userStorageMock = userDataStorage.delete.mockImplementation(() => {});
      await onSignOut(mockPush, mockDispatch);
      expect(mockSession.triggerSignOut).toHaveBeenCalled();
      expect(userStorageMock).toHaveBeenCalledWith(user.id);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGOUT",
        user: undefined,
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
