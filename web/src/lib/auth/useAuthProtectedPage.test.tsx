import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { signInSamlError, useAuthProtectedPage, useUnauthedOnlyPage } from "@/lib/auth/useAuthProtectedPage";
import { withAuth } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { render } from "@testing-library/react";
import React from "react";

jest.mock("next/router");

describe("useAuthProtectedPage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true, asPath: "" });
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
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/",
        query: {},
      });
    });
    it("redirects to homepage when user is not authed", () => {
      useMockRouter({ isReady: true, asPath: signInSamlError });
      setupHookWithAuth(useAuthProtectedPage, IsAuthenticated.FALSE);
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/",
        query: { signUp: "true" },
      });
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
