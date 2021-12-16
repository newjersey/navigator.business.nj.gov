import * as api from "@/lib/api-client/apiClient";
import { generateUser, generateUserData } from "@/test/factories";
import * as session from "./sessionHelper";
import { onSignIn, onSignOut } from "./signinHelper";

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

  describe("onSignOut", () => {
    it("dispatches a logout with undefined user", async () => {
      await onSignOut(mockPush, mockDispatch);

      expect(mockSession.triggerSignOut).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGOUT",
        user: undefined,
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
