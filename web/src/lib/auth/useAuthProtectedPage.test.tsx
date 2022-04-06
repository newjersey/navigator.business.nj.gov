import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  signInSamlError,
  useAuthAlertPage,
  useAuthProtectedPage,
  useUnauthedOnlyPage,
} from "@/lib/auth/useAuthProtectedPage";
import { withAuth, withAuthAlert } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { render } from "@testing-library/react";
import React from "react";

jest.mock("next/router");

describe("useAuthProtectedPage", () => {
  let setAlertIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true, asPath: "" });
    setAlertIsVisible = jest.fn();
  });

  const setupHookWithAuth = ({
    hook,
    isAuth,
    modalIsVisible,
  }: {
    hook: () => void;
    isAuth: IsAuthenticated;
    modalIsVisible?: boolean;
  }): void => {
    function TestComponent() {
      hook();
      return null;
    }

    render(
      withAuth(
        withAuthAlert(<TestComponent />, isAuth ?? IsAuthenticated.TRUE, {
          modalIsVisible: modalIsVisible ?? false,
          setAlertIsVisible,
        }),
        { isAuthenticated: isAuth }
      )
    );
  };

  describe("useAuthProtectedPage", () => {
    it("redirects to homepage when user is not authed", () => {
      setupHookWithAuth({ hook: useAuthProtectedPage, isAuth: IsAuthenticated.FALSE });
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/",
        query: {},
      });
    });

    it("redirects to homepage when user is not authed", () => {
      useMockRouter({ isReady: true, asPath: signInSamlError });
      setupHookWithAuth({ hook: useAuthProtectedPage, isAuth: IsAuthenticated.FALSE });
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/",
        query: { signUp: "true" },
      });
    });

    it("does nothing when user is authed", () => {
      setupHookWithAuth({ hook: useAuthProtectedPage, isAuth: IsAuthenticated.TRUE });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does nothing when we havent loaded auth state yet", () => {
      setupHookWithAuth({ hook: useAuthProtectedPage, isAuth: IsAuthenticated.UNKNOWN });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("useAuthAlertPage", () => {
    it("hides alert when modal is visible", () => {
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.FALSE, modalIsVisible: true });
      expect(setAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("shows alert when user is not authed", () => {
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.FALSE, modalIsVisible: false });
      expect(setAlertIsVisible).toHaveBeenCalledWith(true);
    });

    it("closes alert when user is not authed but page query route is success=true", () => {
      useMockRouter({ isReady: true, query: { success: "true" } });
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.FALSE, modalIsVisible: true });
      expect(setAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("does not show alert when user auth is unknown", () => {
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.UNKNOWN, modalIsVisible: false });
      expect(setAlertIsVisible).not.toHaveBeenCalled();
    });

    it("does not show alert when user is authed", () => {
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.TRUE, modalIsVisible: false });
      expect(setAlertIsVisible).not.toHaveBeenCalled();
    });
  });

  describe("useUnauthedOnlyPage", () => {
    it("redirects to homepage when user IS authed", () => {
      setupHookWithAuth({ hook: useUnauthedOnlyPage, isAuth: IsAuthenticated.TRUE });
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("does nothing when user is NOT authed", () => {
      setupHookWithAuth({ hook: useUnauthedOnlyPage, isAuth: IsAuthenticated.FALSE });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does nothing when we haven't loaded auth state yet", () => {
      setupHookWithAuth({ hook: useUnauthedOnlyPage, isAuth: IsAuthenticated.UNKNOWN });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
