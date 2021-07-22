import { withAuth } from "@/test/helpers";
import { useRouter } from "next/router";
import { useAuthProtectedPage, useUnauthedOnlyPage } from "./useAuthProtectedPage";
import { IsAuthenticated } from "./AuthContext";
import { render } from "@testing-library/react";

jest.mock("next/router");

describe("useAuthProtectedPage", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockPush,
    });
  });

  const setupHookWithAuth = (hook: () => void, isAuth: IsAuthenticated): void => {
    function TestComponent() {
      hook();
      return null;
    }
    render(withAuth(<TestComponent />, { isAuthenticated: isAuth }));
  };

  describe("useAuthProtectedPage", () => {
    it("redirects to homepage when user is not authed", () => {
      setupHookWithAuth(useAuthProtectedPage, IsAuthenticated.FALSE);
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("does nothing when user is authed", () => {
      setupHookWithAuth(useAuthProtectedPage, IsAuthenticated.TRUE);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does nothing when we havent loaded auth state yet", () => {
      setupHookWithAuth(useAuthProtectedPage, IsAuthenticated.UNKNOWN);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("useUnauthedOnlyPage", () => {
    it("redirects to homepage when user IS authed", () => {
      setupHookWithAuth(useUnauthedOnlyPage, IsAuthenticated.TRUE);
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("does nothing when user is NOT authed", () => {
      setupHookWithAuth(useUnauthedOnlyPage, IsAuthenticated.FALSE);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does nothing when we haven't loaded auth state yet", () => {
      setupHookWithAuth(useUnauthedOnlyPage, IsAuthenticated.UNKNOWN);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
